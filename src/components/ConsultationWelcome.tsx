import type { AnatomyRegionId } from "@/lib/clinical/anatomy-atlas";
import { Icon } from "./WorkspaceUI";

const QUICK_CASES = [
  {
    tag: "Cột sống & Thuốc",
    title: "Thoát vị L4-L5 kèm dùng Bisoprolol",
    regionId: "lumbar" as AnatomyRegionId,
    prompt:
      "Học viên nam 42 tuổi bị thoát vị đĩa đệm L4-L5 (đã qua giai đoạn cấp) và tăng huyết áp đang dùng Bisoprolol 5mg. Tôi muốn lên bài tập thân dưới thay thế Barbell Back Squat và chọn ngưỡng cường độ tim mạch an toàn.",
  },
  {
    tag: "Khớp vai",
    title: "Đau mỏm cùng vai khi đẩy qua đầu",
    regionId: "shoulder" as AnatomyRegionId,
    prompt:
      "Học viên đau mặt trước ngoài khớp vai phải ở cung 70–110 độ khi tập Overhead Press, không đau ban đêm. Cần sàng lọc những gì và chọn chuỗi bài tập regression / phục hồi cơ răng trước (serratus anterior) như thế nào?",
  },
  {
    tag: "Khớp gối",
    title: "Đau khớp chè – đùi khi xuống cầu thang",
    regionId: "knee" as AnatomyRegionId,
    prompt:
      "Học viên đau mặt trước khớp gối trái khi đi xuống cầu thang và khi Squat sâu (hội chứng chè – đùi PFPS). Giải thích cơ chế lực nén PFJ và cách điều chỉnh tỷ lệ mô-men Khớp Gối vs Khớp Háng.",
  },
];

export type ConsultationCase = (typeof QUICK_CASES)[number];

export function ConsultationWelcome() {
  return (
    <div className="py-5 sm:py-7">
      <div className="flex items-start gap-3.5">
        <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl border border-cobalt/15 bg-cobalt-soft text-cobalt">
          <Icon name="activity" className="size-5" />
        </div>
        <div>
          <p className="eyebrow">Từ dữ kiện đến chuyển động</p>
          <h2 className="mt-2 max-w-lg text-[23px] font-semibold leading-[1.4] tracking-[-.04em] text-ink sm:text-[26px]">
            Hôm nay, bạn cần tư vấn gì?
          </h2>
        </div>
      </div>
      <p className="mt-3 max-w-xl text-[13px] leading-7 text-slate">
        Mô tả triệu chứng, bài tập hoặc chỉ số cần kiểm tra. Bắt đầu từ sàng lọc
        an toàn, hiểu cơ chế, rồi chọn cách điều chỉnh phù hợp.
      </p>
    </div>
  );
}

export function ConsultationCases({
  onSelect,
}: {
  onSelect: (item: ConsultationCase) => void;
}) {
  return (
    <div className="border-t border-rule px-5 pb-5 sm:px-6">
      <div className="mb-3 mt-5 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-ink">Tình huống gợi ý</h3>
        <span className="text-[11px] text-slate">Chọn để điền câu hỏi</span>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {QUICK_CASES.map((item, i) => (
          <button
            key={item.title}
            type="button"
            className="consultation-case group flex flex-col justify-between"
            onClick={() => onSelect(item)}
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-medium text-slate">
                  {item.tag}
                </span>
                <span className="font-mono text-[10px] text-slate">
                  0{i + 1}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold leading-6 text-ink">
                {item.title}
              </p>
            </div>
            <span className="mt-4 flex items-center justify-between text-[11px] font-medium text-cobalt">
              Dùng tình huống
              <Icon
                name="arrow-right"
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
