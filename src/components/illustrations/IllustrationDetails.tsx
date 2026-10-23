import { IMAGE_TOPICS, illustrationModelLabel, type ImageReceipt } from "@/lib/illustrations/catalog";

export function IllustrationDetails({ receipt }: { receipt: ImageReceipt }) {
  return (
    <details className="rounded-lg border border-rule bg-sheet p-3 text-xs leading-5 text-slate">
      <summary className="cursor-pointer font-semibold text-cobalt">
        Nguồn, mô tả và chi phí
      </summary>
      <div className="mt-3 space-y-3 [overflow-wrap:anywhere]">
        <p>
          <strong className="text-ink">{illustrationModelLabel(receipt.model)}</strong> ·{" "}
          {receipt.resolution} · {receipt.aspectRatio}
          <br />
          {receipt.costUsd === null
            ? "API chưa trả chi phí thực tế"
            : `Chi phí thực tế: $${receipt.costUsd.toFixed(5)}`}{" "}
          · {(receipt.elapsedMs / 1000).toFixed(1)} giây
        </p>
        <p className="font-mono text-[11px]">{receipt.model} · {receipt.provider}</p>
        <p>{receipt.limitation}</p>
        <p className="whitespace-pre-wrap">
          Mô tả thêm: {receipt.prompt || "Theo mẫu minh họa của app."}
        </p>
        {receipt.reference && (
          <p>
            Tham chiếu: {receipt.reference.name} · SHA-256{" "}
            {receipt.reference.sha256}
          </p>
        )}
        <p>
          Ngữ cảnh lúc tạo:{" "}
          {IMAGE_TOPICS.find((t) => t.id === receipt.topicId)?.label}. Nguồn
          dưới đây cung cấp ngữ cảnh để đối chiếu; không xác nhận từng chi tiết
          của ảnh AI.
        </p>
        <ul className="space-y-2">
          {receipt.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-cobalt underline underline-offset-2"
              >
                {source.title} ↗
              </a>
              <p>
                Đối chiếu {source.checkedAt} · {source.access}
              </p>
            </li>
          ))}
        </ul>
        <p>
          Ảnh tạo {new Date(receipt.createdAt).toLocaleString("vi-VN")} ·
          SHA-256 {receipt.sha256}
        </p>
        <details>
          <summary className="cursor-pointer text-cobalt">
            Xem mô tả đầy đủ đã gửi
          </summary>
          <p className="mt-2 whitespace-pre-wrap">{receipt.compiledPrompt}</p>
        </details>
      </div>
    </details>
  );
}
