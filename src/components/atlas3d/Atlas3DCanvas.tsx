"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/WorkspaceUI";
import type { AtlasStage } from "./atlas-stage";
import type { AtlasCanvasProps } from "./types";
import { withLoadDeadline } from "./load-deadline";

export default function Atlas3DCanvas(props: AtlasCanvasProps) {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<AtlasStage | null>(null);
  const latest = useRef(props);
  const [status, setStatus] = useState<{
    url: string;
    retry: number;
    loading: boolean;
    error: boolean;
    progress: number | null;
  }>({ url: "", retry: 0, loading: true, error: false, progress: null });
  const [retry, setRetry] = useState(0);
  const currentStatus =
    status.url === props.bundleUrl && status.retry === retry;
  const loading = !currentStatus || status.loading;
  const error = currentStatus && status.error;
  const progress = currentStatus ? status.progress : null;

  useEffect(() => {
    latest.current = props;
    stage.current?.update(props);
  }, [props]);
  useEffect(() => {
    let active = true;
    let instance: AtlasStage | null = null;
    let expired = false;
    const url = props.bundleUrl;
    const updateStatus = (changes: Partial<typeof status>) => {
      if (active)
        setStatus((previous) => ({ ...previous, url, retry, ...changes }));
    };
    withLoadDeadline(
      import("./atlas-stage").then(async ({ AtlasStage }) => {
        if (!active || expired || !host.current) return;
        instance = new AtlasStage(host.current, latest.current);
        stage.current = instance;
        updateStatus({ loading: true, error: false, progress: null });
        await instance.load(url, (value) => updateStatus({ progress: value }));
      }),
      30000,
      () => {
        expired = true;
        instance?.dispose();
        if (stage.current === instance) stage.current = null;
        instance = null;
      },
    )
      .then(() => updateStatus({ loading: false }))
      .catch(() => updateStatus({ loading: false, error: true }));
    return () => {
      active = false;
      instance?.dispose();
      if (stage.current === instance) stage.current = null;
      instance = null;
    };
  }, [props.bundleUrl, retry]);
  useEffect(() => {
    stage.current?.command(props.command);
  }, [props.command]);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <div ref={host} className="absolute inset-0" />
      {(loading || error) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/95 p-6 text-center">
          {error ? (
            <div className="max-w-sm space-y-4">
              <Icon name="alert" className="mx-auto size-7 text-caution" />
              <p className="font-semibold text-ink">Không mở được mô hình 3D</p>
              <p className="text-sm text-slate">
                Kiểm tra kết nối và khả năng WebGL của trình duyệt, rồi thử lại.
                Bạn vẫn có thể tra cứu ở bản đồ cơ và bài tập.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => setRetry((value) => value + 1)}
                >
                  Thử lại
                </button>
                <Link
                  className="button-secondary"
                  href="/atlas?tab=hypertrophy"
                >
                  Mở bản đồ cơ
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3" role="status" aria-live="polite">
              <Icon
                name="spinner"
                className="mx-auto size-6 animate-spin text-cobalt"
              />
              <p className="text-sm text-slate">
                {progress === 100
                  ? "Đang giải mã mô hình…"
                  : `Đang tải mô hình${progress === null ? "…" : ` · ${progress}%`}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
