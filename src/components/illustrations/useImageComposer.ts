"use client";
import { useEffect, useRef, useState } from "react";
import { compressImageForUpload } from "@/lib/image-compress";
import {
  IMAGE_PRESETS,
  IMAGE_LIMIT,
  imagePreset,
  type AspectRatio,
  type GeneratedImage,
  type ImageRequest,
  type ImageStatus,
  type LibraryImage,
  type MovementTopicId,
  type PresetId,
  type Resolution,
} from "@/lib/illustrations/catalog";
import {
  dataUrlBlob,
  fileDataUrl,
  saveImage,
} from "@/lib/illustrations/library";
type Reference = { dataUrl: string; name: string };
export type ComposerProps = {
  topicId?: MovementTopicId;
  editImage: LibraryImage | null;
  onBusyChange: (busy: boolean) => void;
};
export function useImageComposer({
  topicId = "patterns",
  editImage,
  onBusyChange,
}: ComposerProps) {
  const [status, setStatus] = useState<ImageStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [topic, setTopic] = useState<MovementTopicId>(topicId);
  const [preset, setPreset] = useState<PresetId>(
    () => imagePreset(editImage?.receipt.presetId ?? "")?.id ?? "upper-arm",
  );
  const [prompt, setPrompt] = useState("");
  const [resolution, setResolution] = useState<Resolution>("2K");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("4:3");
  const [reference, setReference] = useState<Reference | null>(null);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false),
    [preparing, setPreparing] = useState(Boolean(editImage));
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [title, setTitle] = useState(""),
    [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(false);
  const inFlight = useRef(false),
    saveFlight = useRef(false),
    active = useRef(true);
  const uploadRevision = useRef(0),
    inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    active.current = true;
    const abort = new AbortController();
    fetch("/api/illustrations", { signal: abort.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Chưa đọc được cấu hình tạo ảnh.");
        const data: ImageStatus = await res.json();
        if (active.current) setStatus(data);
      })
      .catch((err) => {
        if (!abort.signal.aborted && active.current)
          setStatusError(err instanceof Error ? err.message : "Lỗi cấu hình.");
      });
    return () => {
      active.current = false;
      abort.abort();
    };
  }, [connectionAttempt]);
  useEffect(() => {
    if (!editImage) return;
    let cancelled = false;
    (async () => {
      try {
        const ref = await prepareReference(editImage.blob, editImage.title);
        if (!cancelled) {
          setReference(ref);
          setParentId(editImage.receipt.id);
          setTopic(editImage.receipt.topicId);
          setResolution(editImage.receipt.resolution);
          setAspectRatio(editImage.receipt.aspectRatio);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Chưa mở được ảnh để sửa.",
          );
      } finally {
        if (!cancelled) setPreparing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editImage]);
  async function prepareReference(
    blob: Blob,
    name: string,
  ): Promise<Reference> {
    if (!["image/png", "image/jpeg", "image/webp"].includes(blob.type))
      throw new Error("Chọn ảnh PNG, JPEG hoặc WebP.");
    if (blob.size > 20 * 1024 * 1024)
      throw new Error("Ảnh tham chiếu tối đa 20 MB trước khi chuẩn bị.");
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(blob);
    } catch {
      throw new Error(
        "Không đọc được nội dung ảnh. Hãy chọn tệp PNG, JPEG hoặc WebP khác.",
      );
    }
    try {
      if (bitmap.width * bitmap.height > 40_000_000)
        throw new Error(
          "Ảnh tham chiếu quá lớn; hãy dùng bản dưới 40 megapixel.",
        );
    } finally {
      bitmap.close();
    }
    const file = await compressImageForUpload(
      new File([blob], name, { type: blob.type }),
      2_500_000,
    );
    if (file.size > 2_700_000)
      throw new Error("Ảnh quá lớn; hãy dùng ảnh tham chiếu nhỏ hơn.");
    return { dataUrl: await fileDataUrl(file), name: file.name.slice(0, 160) };
  }
  async function chooseFile(file: File | undefined) {
    if (!file) return;
    const current = ++uploadRevision.current;
    setPreparing(true);
    setError("");
    try {
      const ref = await prepareReference(file, file.name);
      if (active.current && current === uploadRevision.current) {
        setReference(ref);
        setParentId(undefined);
      }
    } catch (err) {
      if (active.current && current === uploadRevision.current)
        setError(err instanceof Error ? err.message : "Không đọc được ảnh.");
    } finally {
      if (active.current && current === uploadRevision.current)
        setPreparing(false);
    }
  }
  async function generate() {
    if (inFlight.current || preparing || !status?.enabled) return;
    inFlight.current = true;
    setBusy(true);
    onBusyChange(true);
    setError("");
    const request: ImageRequest = {
      requestId: crypto.randomUUID(),
      topicId: topic,
      presetId: preset,
      prompt,
      resolution,
      aspectRatio,
      ...(reference ? { reference } : {}),
      ...(parentId ? { parentId } : {}),
    };
    try {
      const response = await fetch("/api/illustrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chưa tạo được ảnh.");
      if (!active.current) return;
      setResult(data);
      setSaved(false);
      const name =
        IMAGE_PRESETS.find((p) => p.id === preset)?.label ?? "Giải phẫu";
      setTitle(`${name} · minh họa giải phẫu`);
      setCaption(
        `${name} — hình giải phẫu do AI mô phỏng. ${IMAGE_LIMIT}`,
      );
    } catch (err) {
      if (active.current)
        setError(
          err instanceof Error
            ? err.message
            : "Mất kết nối; kiểm tra lịch sử OpenRouter trước khi tạo lại.",
        );
    } finally {
      inFlight.current = false;
      if (active.current) {
        setBusy(false);
        onBusyChange(false);
      }
    }
  }
  async function save() {
    if (!result || saveFlight.current) return;
    saveFlight.current = true;
    setSaving(true);
    setError("");
    try {
      await saveImage(result, title, caption);
      if (active.current) setSaved(true);
    } catch (err) {
      if (active.current)
        setError(err instanceof Error ? err.message : "Chưa lưu được ảnh.");
    } finally {
      saveFlight.current = false;
      if (active.current) setSaving(false);
    }
  }
  async function editCurrent() {
    if (!result || busy || preparing) return;
    setPreparing(true);
    setError("");
    try {
      const ref = await prepareReference(dataUrlBlob(result.dataUrl), title);
      if (active.current) {
        setReference(ref);
        setParentId(result.receipt.id);
        setPrompt("");
      }
    } catch (err) {
      if (active.current)
        setError(
          err instanceof Error
            ? err.message
            : "Chưa chuẩn bị được ảnh để chỉnh sửa.",
        );
    } finally {
      if (active.current) setPreparing(false);
    }
  }
  const disabled = busy || preparing;
  function removeReference() {
    uploadRevision.current++;
    setReference(null);
    setParentId(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }
  function retryConnection() {
    setStatusError("");
    setStatus(null);
    setConnectionAttempt((n) => n + 1);
  }
  return {
    status,
    statusError,
    topic,
    setTopic,
    preset,
    setPreset,
    prompt,
    setPrompt,
    resolution,
    setResolution,
    aspectRatio,
    setAspectRatio,
    reference,
    parentId,
    busy,
    preparing,
    error,
    result,
    title,
    setTitle,
    caption,
    setCaption,
    saving,
    saved,
    setSaved,
    inputRef,
    disabled,
    generate,
    chooseFile,
    save,
    editCurrent,
    removeReference,
    retryConnection,
  };
}
export type ImageComposer = ReturnType<typeof useImageComposer>;
