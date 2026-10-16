import Link from "next/link";
import { ChatPanel } from "@/components/ChatPanel";
import { Icon, PageHeading } from "@/components/WorkspaceUI";

const CLINICAL_RULES = [
  {
    tone: "bg-crimson-soft text-crimson",
    title: "Sàng lọc cờ đỏ",
    body: "Đau ngực khi gắng sức, tê yếu lan xuống bàn chân, mất tự chủ đại tiểu tiện, đau ban đêm không giảm khi đổi tư thế → Dừng tập, chuyển khám bác sĩ.",
  },
  {
    tone: "bg-caution-soft text-caution",
    title: "Đối chiếu thuốc & sinh lý",
    body: "Thuốc chẹn beta (Bisoprolol, Metoprolol) làm phẳng nhịp tim → tuyệt đối dùng thang đo RPE & Talk Test. Thuốc hạ đường huyết → kiểm tra bữa ăn trước tập.",
  },
  {
    tone: "bg-cleared-soft text-cleared",
    title: "Điều chỉnh cơ sinh học",
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
    <div>
      <PageHeading
        eyebrow="Lâm sàng & khoa học vận động"
        title="Bàn tư vấn chuyên môn"
        description="Kết nối hồ sơ học viên, cơ sinh học và y văn để thiết kế bài tập có cơ sở."
      />
      <div className="consultation-grid">
        <div className="consultation-chat">
          <ChatPanel
            key={`${params.clientId ?? ""}-${params.prompt ?? ""}`}
            initialClientId={params.clientId}
            initialPrompt={params.prompt}
          />
        </div>
        <aside
          className="consultation-reference space-y-5"
          aria-label="Tham chiếu an toàn trước buổi tập"
        >
          <section className="panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-rule px-5 py-4">
              <Icon name="shield" className="size-4 text-cleared" />
              <h2 className="text-xs font-semibold text-ink">
                Trước mỗi buổi tập
              </h2>
            </div>
            <div className="divide-y divide-rule px-5">
              {CLINICAL_RULES.map((rule, i) => (
                <div key={rule.title} className="py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-semibold ${rule.tone}`}
                    >
                      0{i + 1}
                    </span>
                    <h3 className="text-xs font-semibold text-ink">
                      {rule.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 text-[11px] leading-[1.85] text-slate">
                    {rule.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-cleared/15 bg-cleared-soft/60 p-5">
            <Icon name="atlas" className="mb-3 size-6 text-cleared" />
            <h2 className="text-sm font-semibold text-ink">
              Hiểu cấu trúc.
              <br />
              Chọn đúng chuyển động.
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate">
              Tra cứu cơ, khớp và điểm đau ngay trong Atlas.
            </p>
            <Link
              href="/atlas"
              className="mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-cleared"
            >
              Khám phá Atlas <Icon name="arrow-right" className="size-4" />
            </Link>
          </section>
          <Link
            href="/clients"
            className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-rule bg-sheet px-4 text-xs font-medium text-slate hover:border-cobalt hover:text-cobalt"
          >
            <span className="flex items-center gap-2">
              <Icon name="users" className="size-4" />
              Quản lý hồ sơ học viên
            </span>
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
