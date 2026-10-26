'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ClinicalEvidencePanel } from '@/components/ClinicalEvidencePanel';
import { captureCycle } from './capture-cycle';
import type { CurlInfo, CurlPlayback, CurlView } from './curl-types';
import type { CurlStage } from './curl-stage';
import { atlasStructureName } from '@/lib/clinical/atlas-names';
import { AtlasStructureName, AtlasSourceNames } from '@/components/atlas3d/AtlasStructureName';

const VIEWS: { id: CurlView; label: string }[] = [
  { id: 'oblique', label: 'Góc chéo' },
  { id: 'front', label: 'Phía trước' },
  { id: 'side', label: 'Bên cạnh' },
];

function exportError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/not available|No supported|codec|captureStream/i.test(message)) {
    return 'Trình duyệt này chưa hỗ trợ xuất video. Hãy thử trình duyệt khác.';
  }
  return 'Chưa thể tạo video. Hãy thử lại và giữ trang này mở trong lúc xuất.';
}

export function CableCurlStudy() {
  const controlId = useId();
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<CurlStage | null>(null);
  const playbackRef = useRef<CurlPlayback>({ phase: 0, playing: false });
  const exportControllerRef = useRef<AbortController | null>(null);
  const videoUrlRef = useRef<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [info, setInfo] = useState<CurlInfo | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [playback, setPlayback] = useState<CurlPlayback>({ phase: 0, playing: false });
  const [view, setView] = useState<CurlView>('oblique');
  const [highlight, setHighlight] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedId, setSelectedId] = useState('');
  const [isolated, setIsolated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const [video, setVideo] = useState<{ url: string; extension: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const host = hostRef.current;
    let stage: CurlStage | null = null;
    const load = async () => {
      try {
        const response = await fetch('/anatomy/3d/motion/cable-curl-left.json', { signal: controller.signal });
        if (!response.ok) throw new Error('Source unavailable.');
        const data: CurlInfo = await response.json();
        if (data.status !== 'experimental-simulation' || data.reviewedBy !== null
          || !/^[a-f0-9]{64}$/.test(data.assetSha256)
          || !Array.isArray(data.structures) || !Number.isFinite(data.motion?.durationSeconds)
          || data.motion.durationSeconds <= 0) throw new Error('Source unavailable.');
        const { CurlStage: Stage } = await import('./curl-stage');
        if (controller.signal.aborted || !host) return;
        stage = new Stage(host, data, (state) => {
          if (controller.signal.aborted) return;
          playbackRef.current = state;
          setPlayback(state);
        });
        stageRef.current = stage;
        await stage.load(`/anatomy/3d/motion/cable-curl-left.glb?v=${data.assetSha256}`);
        if (controller.signal.aborted) return;
        stage.setHighlight(true);
        setInfo(data);
        setLoadState('ready');
      } catch {
        if (controller.signal.aborted) return;
        stage?.dispose();
        if (stageRef.current === stage) stageRef.current = null;
        stage = null;
        setLoadState('error');
      }
    };
    void load();
    return () => {
      controller.abort();
      exportControllerRef.current?.abort();
      stage?.dispose();
      if (stageRef.current === stage) stageRef.current = null;
    };
  }, [attempt]);

  useEffect(() => () => {
    exportControllerRef.current?.abort();
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
  }, []);

  const ready = loadState === 'ready';
  const disabled = !ready || exporting;
  const flexors = info?.structures.filter((structure) => structure.role === 'elbow-flexor') ?? [];
  const selectedStructure = info?.structures.find((structure) => structure.id === selectedId);

  const retry = () => {
    setLoadState('loading');
    setInfo(null);
    setView('oblique');
    setHighlight(true);
    setSpeed(1);
    setSelectedId('');
    setIsolated(false);
    playbackRef.current = { phase: 0, playing: false };
    setPlayback(playbackRef.current);
    setAttempt((value) => value + 1);
  };

  const exportVideo = async () => {
    const stage = stageRef.current;
    if (!stage || !info || exportControllerRef.current) return;
    const controller = new AbortController();
    exportControllerRef.current = controller;
    const previousPhase = playbackRef.current.phase;
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    setExporting(true);
    setProgress(0);
    setExportMessage('');
    stage.pause();
    try {
      const result = await captureCycle({
        canvas,
        durationSeconds: info.motion.durationSeconds,
        renderFrame: (phase) => stage.renderExport(phase, canvas),
        signal: controller.signal,
        onProgress: (phase) => {
          if (!controller.signal.aborted && stageRef.current === stage) setProgress(phase);
        },
      });
      if (controller.signal.aborted || stageRef.current !== stage) return;
      const url = URL.createObjectURL(result.blob);
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = url;
      setVideo({ url, extension: result.extension });
    } catch (error) {
      if (stageRef.current === stage) {
        setExportMessage(controller.signal.aborted ? 'Đã hủy xuất video.' : exportError(error));
      }
    } finally {
      if (exportControllerRef.current === controller) exportControllerRef.current = null;
      if (stageRef.current === stage) {
        stage.seek(previousPhase);
        stage.pause();
        setExporting(false);
      }
    }
  };

  return (
    <section className="panel overflow-hidden" aria-labelledby={`${controlId}-title`}>
      <header className="space-y-3 border-b border-rule p-4 sm:p-5">
        <p className="eyebrow">Mô phỏng gập khuỷu · Chuyển động được dựng</p>
        <h3 id={`${controlId}-title`} className="text-lg font-semibold text-ink sm:text-xl">
          Gập khuỷu — tham chiếu cuốn cáp một tay
        </h3>
        <p className="max-w-3xl text-sm leading-6 text-slate">
          Khám phá mô hình giải phẫu tay trái từ Z-Anatomy. Chuyển động và trọng số biến dạng
          được dựng để minh họa; không phải chuyển động hay biến dạng mô đo từ người tập.
        </p>
      </header>

      <div className="relative border-b border-rule bg-canvas">
        <div ref={hostRef} inert={exporting} className="relative h-[360px] w-full sm:h-[460px]" aria-label="Mô hình giải phẫu tay trái chuyển động" />
        {loadState !== 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-canvas p-6 text-center">
            {loadState === 'loading' ? (
              <p role="status" className="text-sm text-slate">Đang tải mô hình giải phẫu…</p>
            ) : (
              <div role="alert" className="space-y-3">
                <p className="text-sm text-ink">Chưa thể tải mô hình. Kiểm tra kết nối rồi thử lại.</p>
                <button type="button" className="button-secondary" onClick={retry}>Tải lại mô hình</button>
              </div>
            )}
          </div>
        )}
        {ready && (
          <p className="pointer-events-none absolute left-3 top-3 rounded-md border border-rule bg-sheet/95 px-2 py-1 font-mono text-[10px] text-slate">
            Z-Anatomy · Tay trái · Mô phỏng
          </p>
        )}
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <fieldset disabled={disabled} className="min-w-0 space-y-4 disabled:opacity-60">
          <legend className="sr-only">Điều khiển chuyển động và góc nhìn</legend>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" className="button-primary" onClick={() => {
                if (playback.playing) stageRef.current?.pause();
                else stageRef.current?.play();
              }}>{playback.playing ? 'Tạm dừng' : 'Phát chuyển động'}</button>
              <button type="button" className="button-secondary" onClick={() => {
                stageRef.current?.seek(0);
                stageRef.current?.play();
              }}>Phát lại</button>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate" htmlFor={`${controlId}-speed`}>
              Tốc độ
              <select id={`${controlId}-speed`} value={speed} className="px-2 py-1.5 text-sm" onChange={(event) => {
                const value = Number(event.target.value);
                setSpeed(value);
                stageRef.current?.setSpeed(value);
              }}>
                <option value={0.5}>0,5×</option>
                <option value={1}>1×</option>
                <option value={1.5}>1,5×</option>
              </select>
            </label>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <label className="font-medium text-ink" htmlFor={`${controlId}-phase`}>Pha chuyển động</label>
              <output htmlFor={`${controlId}-phase`} className="font-mono text-slate">{Math.round(playback.phase * 100)} / 100</output>
            </div>
            <input id={`${controlId}-phase`} type="range" min={0} max={100} step={0.1}
              value={playback.phase * 100} className="w-full accent-cobalt"
              onChange={(event) => {
                stageRef.current?.pause();
                stageRef.current?.seek(Number(event.target.value) / 100);
              }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Góc nhìn">
              {VIEWS.map((item) => (
                <button key={item.id} type="button" aria-pressed={view === item.id}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${view === item.id ? 'border-cobalt bg-cobalt-soft text-cobalt' : 'border-rule bg-sheet text-slate'}`}
                  onClick={() => { setView(item.id); stageRef.current?.setView(item.id); }}>
                  {item.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-ink">
              <input type="checkbox" checked={highlight} className="size-4 accent-cobalt" onChange={(event) => {
                setHighlight(event.target.checked);
                stageRef.current?.setHighlight(event.target.checked);
              }} />
              Đánh dấu cơ gập khuỷu
            </label>
          </div>
          <div className="rounded-lg border border-rule bg-canvas p-3">
            <label htmlFor={`${controlId}-structure`} className="mb-2 block text-xs font-semibold text-ink">Quan sát từng cơ · tên từ mô hình nguồn</label>
            <div className="flex flex-wrap items-center gap-2">
              <select id={`${controlId}-structure`} value={selectedId} className="min-w-0 flex-1 px-2 py-2 text-xs sm:min-w-56" onChange={(event) => {
                const id = event.target.value;
                setSelectedId(id);
                if (isolated) {
                  setIsolated(Boolean(id));
                  stageRef.current?.setIsolation(id || null);
                }
              }}>
                <option value="">Chọn cơ gập khuỷu</option>
                {flexors.map((structure) => <option key={structure.id} value={structure.id}>{atlasStructureName(structure)} · trái</option>)}
              </select>
              <button type="button" className="button-secondary" disabled={!selectedId} aria-pressed={isolated} onClick={() => {
                setIsolated(true);
                stageRef.current?.setIsolation(selectedId);
              }}>Chỉ xem cơ đã chọn</button>
              <button type="button" className="button-secondary" onClick={() => {
                setIsolated(false);
                stageRef.current?.setIsolation(null);
              }}>Hiện tất cả</button>
            </div>
          </div>
        </fieldset>

        {selectedStructure && <div className="space-y-1"><AtlasStructureName structure={selectedStructure} withSide className="text-sm font-semibold text-ink" /><AtlasSourceNames structure={selectedStructure} /></div>}

        {info && (
          <div className="space-y-3 text-xs leading-5 text-slate">
            <p>
              Một chu kỳ được dựng dài {info.motion.durationSeconds} giây, với góc hiển thị quy ước {info.motion.authoredAngleRangeDegrees.join('–')}°.
              {' '}Đây không phải tầm vận động cá nhân hay mức vận động được chỉ định. Màu đánh dấu dùng để quan sát cấu trúc, không thể hiện mức hoạt hóa cơ.
            </p>
            <p>Trọng số biến dạng được dựng theo hình học mô hình. Cáp và tay cầm là hình minh họa quy ước. Bản mẫu chưa xác nhận tư thế toàn thân, cách cầm cáp, lực kéo hoặc biến dạng mô thực tế.</p>
            <ClinicalEvidencePanel evidence={{ status: 'limited', reviewedBy: null, sources: info.sources, supportedClaims: info.supportedClaims, limitations: info.limitations }} />
          </div>
        )}

        <div className="space-y-3 border-t border-rule pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Lưu một chu kỳ chuyển động</p>
              <p className="mt-1 text-xs leading-5 text-slate">Video 1280 × 720 · giữ góc nhìn và cấu trúc đang chọn · tốc độ gốc</p>
            </div>
            {exporting ? (
              <button type="button" className="button-secondary" onClick={() => exportControllerRef.current?.abort()}>Hủy xuất video</button>
            ) : (
              <button type="button" className="button-secondary" disabled={!ready} onClick={() => void exportVideo()}>Xuất video</button>
            )}
          </div>
          {exporting && (
            <div className="space-y-1.5" role="status">
              <p className="text-xs text-slate">Đang tạo video… {Math.round(progress * 100)}%</p>
              <progress value={progress} max={1} aria-label="Tiến độ tạo video" className="h-2 w-full accent-cobalt" />
            </div>
          )}
          {exportMessage && <p role="status" className="text-xs text-caution">{exportMessage}</p>}
          {video && (
            <div className="space-y-3 rounded-lg border border-rule bg-canvas p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-ink">Video đã tạo · {video.extension.toUpperCase()}</p>
                <a className="text-xs font-semibold text-cobalt underline" href={video.url} download={`cable-curl-left-prototype.${video.extension}`}>Tải video</a>
              </div>
              <video key={video.url} src={video.url} controls preload="metadata" className="aspect-video w-full rounded-md bg-ink" aria-label="Video chu kỳ gập khuỷu vừa xuất" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
