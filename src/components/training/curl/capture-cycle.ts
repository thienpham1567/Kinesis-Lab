export type CaptureCycleOptions = {
  canvas: HTMLCanvasElement;
  durationSeconds: number;
  /** Requested capture rate. Browser scheduling and encoding can produce fewer frames. */
  fps?: number;
  /** Draw the entire composited frame synchronously, including any source labels. */
  renderFrame: (phase: number) => void;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
};

export type CapturedCycle = {
  blob: Blob;
  mimeType: string;
  extension: 'mp4' | 'webm';
};

const STARTUP_TIMEOUT_MS = 5000;
const STOP_GRACE_MS = 2000;
const FINAL_PAINT_TIMEOUT_MS = 2000;

const MIME_TYPES = [
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
];

function abortError(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('Video capture cancelled.', 'AbortError');
}

/**
 * Record one wall-time 0..1 cycle from a caller-owned canvas.
 * The final pose is held through a repaint before stopping. The returned promise
 * waits for the recorder's final data and stop event; it does not create a URL.
 * Missing start/stop events fail after bounded grace periods; partial output
 * never becomes a successful result on timeout.
 */
export async function captureCycle({
  canvas,
  durationSeconds,
  fps = 30,
  renderFrame,
  signal,
  onProgress,
}: CaptureCycleOptions): Promise<CapturedCycle> {
  if (signal?.aborted) throw abortError(signal);
  const durationMs = durationSeconds * 1000;
  const frameMs = 1000 / fps;
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new RangeError('Capture duration must be finite and positive.');
  }
  if (!Number.isFinite(fps) || fps <= 0 || !Number.isFinite(frameMs)) {
    throw new RangeError('Capture fps must be finite and positive.');
  }
  if (typeof renderFrame !== 'function') throw new TypeError('renderFrame is required.');
  if (typeof canvas?.captureStream !== 'function' || typeof MediaRecorder !== 'function') {
    throw new Error('Canvas video capture is not available in this browser.');
  }
  if (typeof MediaRecorder.isTypeSupported !== 'function') {
    throw new Error('Video codec support detection is not available in this browser.');
  }
  // Detect the codec before captureStream creates any live media tracks.
  const preferredMime = MIME_TYPES.find(type => MediaRecorder.isTypeSupported(type));
  if (!preferredMime) throw new Error('No supported MP4 or WebM recording codec is available.');

  // A fresh canvas needs pixels before capture starts. Some encoders wait for
  // their first canvas frame before dispatching the recorder's start event.
  renderFrame(0);
  if (signal?.aborted) throw abortError(signal);
  const stream = canvas.captureStream(fps);
  return new Promise<CapturedCycle>((resolve, reject) => {
    let recorder: MediaRecorder | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let startupTimer: ReturnType<typeof setTimeout> | undefined;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    let finalPaintTimer: ReturnType<typeof setTimeout> | undefined;
    let animationFrame: number | undefined;
    let tracksStopped = false;
    let started = false;
    let ending = false;
    let settled = false;
    let cycleComplete = false;
    let hasFailure = false;
    let failure: unknown;
    let startedAt = 0;
    const chunks: Blob[] = [];

    const cancelScheduled = () => {
      if (timer !== undefined) clearTimeout(timer);
      if (startupTimer !== undefined) clearTimeout(startupTimer);
      if (finalPaintTimer !== undefined) clearTimeout(finalPaintTimer);
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      timer = undefined;
      startupTimer = undefined;
      finalPaintTimer = undefined;
      animationFrame = undefined;
    };
    const stopTracks = () => {
      if (tracksStopped) return;
      tracksStopped = true;
      for (const track of stream.getTracks()) {
        // One bad track must not prevent the other tracks from being released.
        try { track.stop(); } catch { /* Already ended or unavailable. */ }
      }
    };
    const rememberFailure = (error: unknown) => {
      if (hasFailure) return;
      hasFailure = true;
      failure = error;
    };
    const cleanup = () => {
      cancelScheduled();
      if (stopTimer !== undefined) clearTimeout(stopTimer);
      stopTimer = undefined;
      signal?.removeEventListener('abort', onAbort);
      recorder?.removeEventListener('start', onStart);
      recorder?.removeEventListener('dataavailable', onData);
      recorder?.removeEventListener('error', onError);
      recorder?.removeEventListener('stop', onStop);
      stopTracks();
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      if (hasFailure) {
        reject(failure);
        return;
      }
      if (!cycleComplete) {
        reject(new Error('Video recorder stopped before the cycle was complete.'));
        return;
      }
      try {
        const mimeType = recorder?.mimeType || preferredMime;
        const extension = mimeType.startsWith('video/mp4') ? 'mp4'
          : mimeType.startsWith('video/webm') ? 'webm' : undefined;
        if (!extension) throw new Error('Video recorder returned an unsupported MIME type.');
        const blob = new Blob(chunks, {type: mimeType});
        if (blob.size === 0) throw new Error('Video recorder returned an empty recording.');
        resolve({blob, mimeType, extension});
      } catch (error) { reject(error); }
    };
    const requestStop = (error?: unknown) => {
      if (settled) return;
      if (error !== undefined) rememberFailure(error);
      if (ending) return;
      ending = true;
      cancelScheduled();
      const awaitStop = () => {
        stopTimer = setTimeout(() => {
          stopTimer = undefined;
          rememberFailure(new DOMException('Video recorder stop event timed out.', 'TimeoutError'));
          finish();
        }, STOP_GRACE_MS);
      };
      if (recorder && recorder.state !== 'inactive') {
        awaitStop();
        try {
          recorder.stop();
          stopTracks();
          // stop() queues final dataavailable and stop; do not settle here.
        } catch (stopError) {
          rememberFailure(stopError);
          finish();
        }
      } else if (started) {
        // A recorder error can make state inactive before its stop event arrives.
        awaitStop();
        stopTracks();
      } else {
        finish();
      }
    };
    const onAbort = () => requestStop(abortError(signal!));
    const onData = (event: BlobEvent) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    const onError = (event: Event) => {
      const error = (event as Event & {error?: DOMException}).error;
      requestStop(error ?? new Error('Video recorder failed.'));
    };
    const onStop = () => finish();
    const holdFinalPose = () => {
      const waitForPaint = () => {
        if (typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function') {
          // Hidden documents can expose rAF while suspending every callback.
          // Fail instead of claiming a flushed final frame or waiting forever.
          finalPaintTimer = setTimeout(() => {
            finalPaintTimer = undefined;
            requestStop(new DOMException('Video final frame repaint timed out.', 'TimeoutError'));
          }, FINAL_PAINT_TIMEOUT_MS);
          // rAF callbacks run before paint. Stop on the following rendering turn
          // so the final synchronous draw can reach the captured stream.
          animationFrame = requestAnimationFrame(() => {
            animationFrame = requestAnimationFrame(() => {
              animationFrame = undefined;
              requestStop();
            });
          });
        } else {
          timer = setTimeout(() => {
            timer = undefined;
            requestStop();
          }, Math.max(32, Math.min(frameMs, 1000)));
        }
      };
      // Both manual and automatic tracks need time for a final source frame to
      // reach the encoder. Hold it for two requested sampling intervals, then
      // draw/request it again before the rendering-turn flush. Manual requests
      // alone do not mean the encoder has consumed a frame synchronously.
      const finalHoldMs = frameMs * 2;
      const finalAt = performance.now();
      const redrawFinal = () => {
        timer = undefined;
        if (ending) return;
        const remaining = finalHoldMs - (performance.now() - finalAt);
        if (remaining > 0) {
          timer = setTimeout(redrawFinal, Math.min(remaining, 1000));
          return;
        }
        try {
          draw(1);
          if (!ending) waitForPaint();
        } catch (error) { requestStop(error); }
      };
      timer = setTimeout(redrawFinal, Math.min(finalHoldMs, 1000));
    };
    let videoTrack: CanvasCaptureMediaStreamTrack;
    const draw = (phase: number) => {
      renderFrame(phase);
      if (ending) return;
      // renderFrame is deliberately synchronous, before a manual frame request.
      if (typeof videoTrack.requestFrame === 'function') videoTrack.requestFrame();
      onProgress?.(phase);
    };
    const scheduleFrame = () => {
      const elapsed = performance.now() - startedAt;
      timer = setTimeout(tick, Math.max(0, Math.min(frameMs, durationMs - elapsed, 1000)));
    };
    const tick = () => {
      timer = undefined;
      if (ending) return;
      try {
        const phase = Math.min(1, Math.max(0, (performance.now() - startedAt) / durationMs));
        draw(phase);
        if (ending) return;
        if (phase === 1) {
          cycleComplete = true;
          holdFinalPose();
        } else scheduleFrame();
      } catch (error) { requestStop(error); }
    };
    const onStart = () => {
      if (ending) return;
      if (startupTimer !== undefined) clearTimeout(startupTimer);
      startupTimer = undefined;
      try {
        startedAt = performance.now();
        draw(0);
        if (!ending) scheduleFrame();
      } catch (error) { requestStop(error); }
    };

    try {
      const firstVideoTrack = stream.getVideoTracks()[0];
      if (!firstVideoTrack) throw new Error('Canvas capture did not provide a video track.');
      videoTrack = firstVideoTrack as CanvasCaptureMediaStreamTrack;
      recorder = new MediaRecorder(stream, {mimeType: preferredMime});
      recorder.addEventListener('start', onStart);
      recorder.addEventListener('dataavailable', onData);
      recorder.addEventListener('error', onError);
      recorder.addEventListener('stop', onStop);
      signal?.addEventListener('abort', onAbort);
      if (signal?.aborted) {
        onAbort();
        return;
      }
      startupTimer = setTimeout(() => {
        startupTimer = undefined;
        requestStop(new DOMException('Video recorder start event timed out.', 'TimeoutError'));
      }, STARTUP_TIMEOUT_MS);
      recorder.start();
      started = true;
    } catch (error) { requestStop(error); }
  });
}
