// Synthetic browser lifecycle checks only: these do not exercise a real video codec.
import assert from 'node:assert/strict';

let captureCycle;
try {
  ({captureCycle} = await import('../src/components/training/curl/capture-cycle.ts'));
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}
assert.equal(typeof captureCycle, 'function', 'captureCycle must be implemented');

class ListenedTarget extends EventTarget {
  listeners = new Map();
  addEventListener(type, listener, options) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
    super.addEventListener(type, listener, options);
  }
  removeEventListener(type, listener, options) {
    this.listeners.get(type)?.delete(listener);
    super.removeEventListener(type, listener, options);
  }
  get listenerCount() {
    return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0);
  }
}

function browser(config = {}) {
  const originals = new Map();
  let now = 0;
  let nextId = 0;
  const pending = new Map();
  const suspendedAnimationFrames = new Map();
  const log = [];
  const instances = [];
  const signal = new ListenedTarget();
  signal.aborted = false;
  signal.reason = undefined;
  const abort = () => {
    signal.aborted = true;
    signal.reason = new DOMException('Cancelled', 'AbortError');
    signal.dispatchEvent(new Event('abort'));
  };
  const timer = (callback, delay = 0) => {
    const id = ++nextId;
    pending.set(id, {at: now + Math.max(0, delay), callback});
    return id;
  };
  const tracks = [0, 1].map((index) => ({
    kind: index === 0 ? 'video' : 'audio',
    stops: 0,
    stop() { this.stops++; log.push(['track-stop', now]); },
    ...(index === 0 && !config.noRequestFrame ? {
      requestFrame() {
        if (config.requestError) throw new Error('request frame failed');
        log.push(['request', now]);
      },
    } : {}),
  }));
  const stream = {
    getTracks: () => tracks,
    getVideoTracks: () => config.noVideoTrack ? [] : [tracks[0]],
  };
  const canvas = config.noCaptureStream ? {} : {
    captureStream(fps) {
      log.push(['capture', fps]);
      if (config.captureError) throw new Error('capture failed');
      return stream;
    },
  };
  class Recorder extends ListenedTarget {
    static isTypeSupported(type) { return (config.supported ?? ['video/mp4', 'video/webm']).includes(type); }
    state = 'inactive';
    mimeType;
    constructor(input, {mimeType}) {
      super();
      if (config.constructorError) throw new Error('constructor failed');
      assert.equal(input, stream);
      this.mimeType = config.actualMimeType ?? mimeType;
      instances.push(this);
      log.push(['recorder', mimeType]);
    }
    start() {
      if (config.startError) throw new Error('start failed');
      this.state = 'recording';
      if (!config.noStartEvent) timer(() => { this.dispatchEvent(new Event('start')); }, 3);
    }
    stop() {
      log.push(['stop', now]);
      this.state = 'inactive';
      if (config.stopError) throw new Error('stop failed');
      if (config.noStopEvent && !config.partialData) return;
      timer(() => {
        const event = new Event('dataavailable');
        event.data = new Blob(config.empty ? [] : ['encoded-cycle'], {type: this.mimeType});
        this.dispatchEvent(event);
        log.push(['data', now]);
        if (!config.noStopEvent) {
          this.dispatchEvent(new Event('stop'));
          log.push(['stopped', now]);
        }
      }, 7);
    }
  }
  const replace = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {configurable: true, writable: true, value});
  };
  replace('MediaRecorder', config.noRecorder ? undefined : Recorder);
  replace('performance', {now: () => now});
  replace('setTimeout', timer);
  replace('clearTimeout', id => pending.delete(id));
  replace('requestAnimationFrame', config.noRaf ? undefined : callback => {
    if (config.suspendedRaf) {
      const id = ++nextId;
      suspendedAnimationFrames.set(id, callback);
      return id;
    }
    return timer(() => callback(now), 16);
  });
  replace('cancelAnimationFrame', id => {
    pending.delete(id);
    suspendedAnimationFrames.delete(id);
  });
  const tick = () => {
    const next = [...pending].sort((a, b) => a[1].at - b[1].at)[0];
    assert(next, 'capture must settle or schedule work');
    pending.delete(next[0]);
    now = next[1].at;
    next[1].callback();
  };
  return {
    canvas, signal, abort, tracks, log, instances, pending, timer,
    get now() { return now; },
    async drain(promise) {
      let settled = false;
      let outcome;
      promise.then(value => { settled = true; outcome = {value}; }, error => { settled = true; outcome = {error}; });
      for (let i = 0; !settled && i < 1000; i++) {
        for (let turn = 0; turn < 5; turn++) await Promise.resolve();
        if (!settled) tick();
      }
      assert(settled, 'capture must settle');
      if (outcome.error) throw outcome.error;
      return outcome.value;
    },
    cleanup({captured = true, attempted = captured} = {}) {
      assert.equal(pending.size, 0, 'all scheduled work must be cleared');
      assert.equal(suspendedAnimationFrames.size, 0, 'suspended animation callbacks must be cancelled');
      assert.equal(signal.listenerCount, 0, 'abort listener removed');
      for (const recorder of instances) {
        assert.equal(recorder.listenerCount, 0, 'recorder listeners removed');
        assert.equal(recorder.state, 'inactive');
      }
      if (captured) for (const track of tracks) assert.equal(track.stops, 1, 'each track stopped exactly once');
      else {
        for (const track of tracks) assert.equal(track.stops, 0);
        if (!attempted) assert.equal(log.some(([name]) => name === 'capture'), false, 'captureStream must not run');
      }
    },
    restore() {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}

let passed = 0;
async function check(name, config, body) {
  if (process.env.CURL_CAPTURE_CHECK && !name.includes(process.env.CURL_CAPTURE_CHECK)) return;
  const fixture = browser(config);
  try {
    await body(fixture);
    passed++;
    console.log(`PASS ${name}`);
  } finally { fixture.restore(); }
}
const options = fixture => ({canvas: fixture.canvas, durationSeconds: 0.1, fps: 25, signal: fixture.signal, renderFrame() {}});

await check('complete wall-time cycle includes final pose and waits for recorder data', {}, async fixture => {
  const phases = [];
  const progress = [];
  let resolved = false;
  const promise = captureCycle({...options(fixture), renderFrame(phase) {
    phases.push({phase, time: fixture.now});
    fixture.log.push(['render', fixture.now]);
  }, onProgress: value => progress.push(value)}).then(result => { resolved = true; return result; });
  assert.equal(resolved, false);
  const result = await fixture.drain(promise);
  assert.equal(result.extension, 'mp4');
  assert.equal(result.mimeType, 'video/mp4');
  assert.equal(await result.blob.text(), 'encoded-cycle');
  assert.equal(phases[0].phase, 0);
  assert.equal(phases.at(-1).phase, 1);
  assert(phases.at(-1).time - phases[0].time >= 100, 'cycle consumes real elapsed time');
  assert(phases.some(({phase}) => phase > 0 && phase < 1));
  assert.equal(progress[0], 0);
  assert.equal(progress.at(-1), 1);
  for (let i = 1; i < progress.length; i++) assert(progress[i] >= progress[i - 1]);
  const stop = fixture.log.find(([name]) => name === 'stop');
  assert(stop[1] > phases.at(-1).time, 'final canvas pose gets a repaint opportunity before stop');
  for (let i = 0; i < fixture.log.length; i++) {
    if (fixture.log[i][0] === 'request') assert.equal(fixture.log[i - 1][0], 'render', 'draw synchronously before requesting capture');
  }
  fixture.cleanup();
});

await check('fresh canvas is drawn before captureStream and recorder construction', {}, async fixture => {
  const promise = captureCycle({...options(fixture), renderFrame(phase) {
    fixture.log.push(['render', phase]);
  }});
  assert.deepEqual(fixture.log[0], ['render', 0], 'initial pose must precede stream creation');
  await fixture.drain(promise);
  fixture.cleanup();
});

await check('missing start event times out with complete cleanup', {noStartEvent: true}, async fixture => {
  await assert.rejects(fixture.drain(captureCycle(options(fixture))), {name: 'TimeoutError'});
  assert(fixture.now <= 10000, 'startup cannot wait indefinitely');
  fixture.cleanup();
});

await check('missing stop event cannot return a successful partial clip', {noStopEvent: true, partialData: true}, async fixture => {
  await assert.rejects(fixture.drain(captureCycle(options(fixture))), {name: 'TimeoutError'});
  assert(fixture.log.some(([name]) => name === 'data'), 'partial encoded data arrived before timeout');
  assert(fixture.now <= 10000, 'recorder completion has a finite grace period');
  fixture.cleanup();
});

await check('abort before start with no recorder events cannot hang', {noStartEvent: true, noStopEvent: true}, async fixture => {
  const promise = captureCycle(options(fixture));
  fixture.timer(fixture.abort, 20);
  await assert.rejects(fixture.drain(promise), {name: 'AbortError'});
  assert(fixture.now <= 5020, 'cancellation grace is bounded');
  fixture.cleanup();
});

await check('abort during capture with missing stop event cleans up after grace', {noStopEvent: true}, async fixture => {
  const promise = captureCycle(options(fixture));
  fixture.timer(fixture.abort, 45);
  await assert.rejects(fixture.drain(promise), {name: 'AbortError'});
  assert(fixture.now <= 5045, 'cancellation grace is bounded');
  fixture.cleanup();
});

await check('missing start and stop events still fail and release everything', {noStartEvent: true, noStopEvent: true}, async fixture => {
  await assert.rejects(fixture.drain(captureCycle(options(fixture))), {name: 'TimeoutError'});
  assert(fixture.now <= 10000);
  fixture.cleanup();
});

await check('WebM fallback works without requestFrame or animation frame API', {supported: ['video/webm;codecs=vp8'], noRequestFrame: true, noRaf: true}, async fixture => {
  const result = await fixture.drain(captureCycle(options(fixture)));
  assert.equal(result.extension, 'webm');
  assert.equal(result.mimeType, 'video/webm;codecs=vp8');
  fixture.cleanup();
});

await check('automatic capture gets a complete sampling interval and a fresh final draw', {noRequestFrame: true}, async fixture => {
  const phases = [];
  await fixture.drain(captureCycle({...options(fixture), fps: 10, renderFrame(phase) {
    phases.push({phase, time: fixture.now});
  }}));
  const firstFinal = phases.find(({phase}) => phase === 1);
  const lastFinal = phases.at(-1);
  assert(lastFinal.time - firstFinal.time >= 100, 'redraw final pose after one automatic sampling interval');
  assert(fixture.log.find(([name]) => name === 'stop')[1] > lastFinal.time);
  fixture.cleanup();
});

await check('manual capture holds final pose for two sampling intervals and redraws before flush', {}, async fixture => {
  const phases = [];
  const promise = captureCycle({...options(fixture), renderFrame(phase) {
    phases.push({phase, time: fixture.now});
    fixture.log.push(['render', fixture.now]);
  }});
  await fixture.drain(promise);
  const firstFinal = phases.find(({phase}) => phase === 1);
  const lastFinal = phases.at(-1);
  assert(lastFinal.time - firstFinal.time >= 80, 'manual capture redraws after two requested sampling intervals');
  assert(fixture.log.find(([name]) => name === 'stop')[1] > lastFinal.time, 'redraw gets a rendering turn before stop');
  const lastRequest = fixture.log.findLastIndex(([name]) => name === 'request');
  assert.equal(fixture.log[lastRequest - 1][0], 'render', 'fresh final draw precedes manual request');
  fixture.cleanup();
});

await check('abort during final hold stops recording and clears hold work', {}, async fixture => {
  let finalDrawn = false;
  const promise = captureCycle({...options(fixture), renderFrame(phase) {
    if (phase === 1 && !finalDrawn) {
      finalDrawn = true;
      fixture.timer(fixture.abort, 10);
    }
  }});
  await assert.rejects(fixture.drain(promise), {name: 'AbortError'});
  assert(finalDrawn);
  fixture.cleanup();
});

await check('error in final hold redraw releases recorder and all resources', {}, async fixture => {
  let finalDraws = 0;
  const promise = captureCycle({...options(fixture), renderFrame(phase) {
    if (phase === 1 && ++finalDraws > 1) throw new Error('final redraw failed');
  }});
  await assert.rejects(fixture.drain(promise), /final redraw failed/);
  fixture.cleanup();
});

await check('present but suspended animation frame API fails with complete cleanup', {suspendedRaf: true}, async fixture => {
  await assert.rejects(fixture.drain(captureCycle(options(fixture))), {name: 'TimeoutError'});
  assert(fixture.now < 10000, 'final repaint wait is bounded');
  assert(fixture.log.some(([name]) => name === 'stopped'), 'recorder completion still awaited on repaint timeout');
  fixture.cleanup();
});

await check('reports recorder selected MIME, with default target frame rate', {actualMimeType: 'video/mp4;codecs=avc1.42001e'}, async fixture => {
  const args = options(fixture);
  delete args.fps;
  const result = await fixture.drain(captureCycle(args));
  assert.equal(result.mimeType, 'video/mp4;codecs=avc1.42001e');
  assert.deepEqual(fixture.log.find(([name]) => name === 'capture'), ['capture', 30]);
  fixture.cleanup();
});

for (const [name, config, message] of [
  ['empty blob', {empty: true}, /empty/i],
  ['recorder constructor error', {constructorError: true}, /constructor failed/],
  ['recorder start error', {startError: true}, /start failed/],
  ['captureStream error', {captureError: true}, /capture failed/],
  ['missing video track', {noVideoTrack: true}, /video track/i],
  ['requestFrame error', {requestError: true}, /request frame failed/],
  ['recorder stop error', {stopError: true}, /stop failed/],
]) {
  await check(name, config, async fixture => {
    await assert.rejects(fixture.drain(captureCycle(options(fixture))), message);
    fixture.cleanup({captured: !config.captureError, attempted: true});
  });
}

for (const [name, config] of [
  ['missing MediaRecorder', {noRecorder: true}],
  ['missing canvas capture API', {noCaptureStream: true}],
  ['unsupported codecs', {supported: []}],
]) {
  await check(name, config, async fixture => {
    await assert.rejects(captureCycle(options(fixture)), /support|available/i);
    fixture.cleanup({captured: false});
  });
}

await check('abort before capture does not mutate stream', {}, async fixture => {
  fixture.abort();
  await assert.rejects(captureCycle(options(fixture)), {name: 'AbortError'});
  fixture.cleanup({captured: false});
});

await check('abort while recording waits for stop and clears all resources', {}, async fixture => {
  const promise = captureCycle(options(fixture));
  fixture.timer(fixture.abort, 45);
  await assert.rejects(fixture.drain(promise), {name: 'AbortError'});
  assert(fixture.log.some(([name]) => name === 'stopped'), 'abort awaits actual recorder stop');
  fixture.cleanup();
});

await check('asynchronous recorder error rejects after actual recorder stop', {}, async fixture => {
  const promise = captureCycle(options(fixture));
  fixture.timer(() => {
    const event = new Event('error');
    event.error = new DOMException('encoder failed', 'EncodingError');
    fixture.instances[0].dispatchEvent(event);
  }, 45);
  await assert.rejects(fixture.drain(promise), /encoder failed/);
  assert(fixture.log.some(([name]) => name === 'stopped'));
  fixture.cleanup();
});

await check('unexpected early stop rejects incomplete cycle', {}, async fixture => {
  const promise = captureCycle(options(fixture));
  fixture.timer(() => fixture.instances[0].stop(), 45);
  await assert.rejects(fixture.drain(promise), /complete|early/i);
  fixture.cleanup();
});

for (const kind of ['initial render', 'later render', 'progress']) {
  await check(`${kind} callback error clears resources`, {}, async fixture => {
    await assert.rejects(fixture.drain(captureCycle({...options(fixture), renderFrame(phase) {
      if (kind === 'initial render' || (kind === 'later render' && phase > 0)) throw new Error('callback failed');
    }, onProgress() { if (kind === 'progress') throw new Error('callback failed'); }})), /callback failed/);
    fixture.cleanup({captured: kind !== 'initial render'});
  });
}

for (const key of ['durationSeconds', 'fps']) {
  for (const value of [0, -1, Infinity, NaN]) {
    await check(`invalid ${key} ${value}`, {}, async fixture => {
      await assert.rejects(captureCycle({...options(fixture), [key]: value}), /finite|positive/i);
      fixture.cleanup({captured: false});
    });
  }
}
console.log(`Canvas capture: ${passed} synthetic checks passed. Real browser codec output is not covered.`);
