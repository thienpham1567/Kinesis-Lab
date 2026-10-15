import Link from "next/link";
import { ChatPanel } from "@/components/ChatPanel";

const CLINICAL_RULES = [
  {
    tone: "border-l-crimson bg-crimson-soft/60 text-crimson",
    title: "Tầng 1 — Cờ Đỏ Y khoa (Red Flags)",
    body: "Đau ngực khi gắng sức, tê yếu lan xuống bàn chân, mất tự chủ đại tiểu tiện, đau ban đêm không giảm khi đổi tư thế → Dừng tập, chuyển khám bác sĩ.",
  },
  {
    tone: "border-l-caution bg-caution-soft/60 text-caution",
    title: "Tầng 2 — Thuốc & Sinh lý gắn liền",
    body: "Thuốc chẹn beta (Bisoprolol, Metoprolol) làm phẳng nhịp tim → tuyệt đối dùng thang đo RPE & Talk Test. Thuốc hạ đường huyết → kiểm tra bữa ăn trước tập.",
  },
  {
    tone: "border-l-cleared bg-cleared-soft/60 text-cleared",
    title: "Tầng 3 — Điều chỉnh Cơ sinh học",
    body: "Đau cơ học có quy luật (Mechanical Pain) → giảm cánh tay đòn, đổi góc khớp về biên độ không đau (Safe ROM) và tăng dần tải theo dung nạp mô.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string; clientId?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="space-y-3.5">
        <div className="rounded-lg border border-rule bg-sheet p-4 shadow-xs">
          <h1 className="font-display text-xl font-bold leading-snug tracking-tight text-ink">
            Sàng lọc trước mỗi hiệp tập
          </h1>
          <p className="mt-1.5 text-xs leading-5 text-slate">
            Đối chiếu hồ sơ học viên, atlas khớp và y văn ACSM / NSCA / PubMed trước khi giao bài.
          </p>

          <div className="mt-3 flex flex-col gap-1.5">
            <Link
              href="/atlas"
              className="rounded-md bg-cobalt px-3 py-2 text-center text-xs font-semibold text-white hover:opacity-95"
            >
              Mở Atlas cơ & bài tập
            </Link>
            <Link
              href="/clients"
              className="rounded-md border border-rule bg-sheet px-3 py-2 text-center text-xs font-semibold text-ink hover:border-cobalt hover:text-cobalt"
            >
              Hồ sơ học viên
            </Link>
          </div>
        </div>

        <div className="space-y-2.5">
          {CLINICAL_RULES.map((rule) => (
            <div
              key={rule.title}
              className={`rounded-md border border-rule border-l-4 p-3 ${rule.tone}`}
            >
              <p className="font-display text-xs font-bold">{rule.title}</p>
              <p className="mt-1 text-xs leading-5 text-ink">{rule.body}</p>
            </div>
          ))}
        </div>
      </aside>

      <ChatPanel
        key={`${params.clientId ?? ""}-${params.prompt ?? ""}`}
        initialClientId={params.clientId}
        initialPrompt={params.prompt}
      />
    </div>
  );
}
