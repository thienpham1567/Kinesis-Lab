"use client";

import { useState } from "react";
import { PT_CASES } from "@/lib/learning/pt-cases";
import { NCSF_DOMAINS } from "@/lib/ncsf-quiz";
import { SHORT_SESSION_MAX_ITEMS } from "@/lib/learning/schedule";
import type { DomainLearningSummary, LearningDraft } from "@/lib/learning/types";
import type { UseLearningProgressResult } from "./useLearningProgress";

export type ReadingBookmark = {
  slug: string;
  chapterTitle: string;
  page: number;
};

const DOMAIN_METRICS: {
  label: string;
  value: (domain: DomainLearningSummary) => string | number;
}[] = [
  { label: "Số câu từng gặp", value: (domain) => domain.seenCount },
  { label: "Số lần thử", value: (domain) => domain.attempts },
  {
    label: "Đúng lần đầu",
    value: (domain) =>
      `${domain.firstTryRate}% (${domain.firstTryCorrectCount}/${domain.seenCount})`,
  },
  {
    label: "Đúng gần nhất",
    value: (domain) =>
      `${domain.latestRate}% (${domain.latestCorrectCount}/${domain.seenCount})`,
  },
  { label: "Đến hạn ôn", value: (domain) => domain.dueCount },
];

function formatLocalDateTime(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return iso;
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleString("vi-VN");
  }
}

export function LearningDashboard({
  progress,
  readingBookmark,
  onOpenCases,
  onResumeDraft,
  onStartDueReview,
  onStartDomainStudy,
  onResumeReading,
}: {
  progress: UseLearningProgressResult;
  readingBookmark: ReadingBookmark;
  onOpenCases: () => void;
  onResumeDraft: (draft: LearningDraft) => void;
  onStartDueReview: () => void;
  onStartDomainStudy: (domain: string) => void;
  onResumeReading: () => void;
}) {
  const {
    hydrated,
    drafts,
    submissions,
    summary,
    storeWarning,
    saveError,
    revisionConflict,
    retryLastSave,
    resolveRevisionConflict,
    clearAllProgress,
  } = progress;

  const [selectedDomain, setSelectedDomain] = useState<string>(
    Object.keys(NCSF_DOMAINS)[0] ?? "functional-anatomy",
  );
  const [confirmClear, setConfirmClear] = useState(false);

  const caseHistory = submissions.filter((sub) => sub.source === "pt-case");
  const ncsfHistory = submissions.filter((sub) => sub.source !== "pt-case");
  const primaryDraft = drafts[0] ?? null;
  const dueCount = summary.dueItems.length;

  return (
    <div
      className="learning-dashboard space-y-6"
      aria-label="Tiến độ trên trình duyệt này"
    >
      <section className="panel learning-card space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-ink">
              Tiến độ trên trình duyệt này
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate">
              Lịch sử làm bài, kết quả tình huống và bản nháp NCSF được lưu
              bằng mã định danh trên trình duyệt này. Lý do tự ghi chỉ có
              trong phiên luyện đang mở. Đăng xuất không xóa tiến độ đã lưu.
            </p>
          </div>
          {!confirmClear ? (
            <button
              type="button"
              className="button-secondary"
              onClick={() => setConfirmClear(true)}
            >
              Xóa tiến độ
            </button>
          ) : (
            <div
              className="flex flex-wrap items-center gap-2 rounded-lg border border-crimson/40 bg-crimson-soft p-2.5 text-sm"
              role="group"
              aria-label="Xác nhận xóa tiến độ"
            >
              <span className="font-semibold text-ink">
                Xóa toàn bộ lịch sử và phiên đang dở trên trình duyệt này?
              </span>
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  setConfirmClear(false);
                  void clearAllProgress();
                }}
              >
                Xác nhận xóa tiến độ
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setConfirmClear(false)}
              >
                Hủy
              </button>
            </div>
          )}
        </div>

        {saveError && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-crimson/40 bg-crimson-soft p-3 text-sm text-ink"
            role="alert"
          >
            <p>{saveError}</p>
            <button
              type="button"
              className="button-secondary"
              onClick={() => void retryLastSave()}
            >
              Thử lưu lại
            </button>
          </div>
        )}

        {revisionConflict && (
          <div
            className="space-y-2 rounded-lg border border-caution/40 bg-caution-soft p-3 text-sm text-ink"
            role="alert"
          >
            <p className="font-semibold">
              Phiên đang học đã được cập nhật ở một tab khác.
            </p>
            <p className="text-slate">
              Bản bạn đang chọn vẫn giữ trong bộ nhớ. Bạn có thể tải bản mới từ
              tab kia hoặc bắt đầu phiên mới.
            </p>
            <div className="flex flex-wrap gap-2">
              {revisionConflict.remoteDraft && (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => void resolveRevisionConflict("load-remote")}
                >
                  Tải bản từ tab khác
                </button>
              )}
              <button
                type="button"
                className="button-secondary"
                onClick={() => void resolveRevisionConflict("start-fresh")}
              >
                Bắt đầu phiên mới
              </button>
            </div>
          </div>
        )}

        {storeWarning && (
          <p
            className="rounded-lg border border-caution/40 bg-caution-soft p-3 text-sm text-ink"
            role="status"
          >
            {storeWarning}
          </p>
        )}
      </section>

      <div className="learning-grid grid gap-4 lg:grid-cols-3">
        <section
          className="panel learning-card flex flex-col justify-between space-y-4 p-4 sm:p-5"
          aria-label="Tiếp tục phiên đang học"
        >
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-ink">
              Tiếp tục phiên đang học
            </h3>
            {primaryDraft ? (
              <div className="space-y-1 text-sm text-slate">
                <p className="font-medium text-ink">
                  {primaryDraft.source === "ncsf-mock"
                    ? "Đề thi thử NCSF"
                    : "Đề cương ôn tập theo chương/bài"}
                </p>
                <p>
                  Đã chọn{" "}
                  <span className="font-mono font-semibold text-ink">
                    {
                      primaryDraft.items.filter(
                        (it) => it.selectedOptionId !== null,
                      ).length
                    }
                    /{primaryDraft.items.length}
                  </span>{" "}
                  câu · Cập nhật {formatLocalDateTime(primaryDraft.updatedAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate">
                Chưa có bài làm dở. Khi bạn chọn đáp án trong Đề cương ôn tập
                hoặc Đề thi thử, phiên làm dở sẽ tự lưu tại đây.
              </p>
            )}
            <div className="border-t border-rule pt-2 text-xs leading-5 text-slate">
              <p>
                Trang giáo trình đang mở: {readingBookmark.chapterTitle} · Trang{" "}
                <span className="font-mono font-semibold text-ink">
                  {readingBookmark.page}
                </span>{" "}
                (chỉ lưu vị trí trang để đọc tiếp, không tính thành mức độ nắm
                vững kiến thức).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="button-primary"
              disabled={!primaryDraft}
              onClick={() => {
                if (primaryDraft) onResumeDraft(primaryDraft);
              }}
            >
              Tiếp tục
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={onResumeReading}
            >
              Đọc tiếp trang {readingBookmark.page}
            </button>
          </div>
        </section>

        <section
          className="panel learning-card flex flex-col justify-between space-y-4 p-4 sm:p-5"
          aria-label="Ôn câu đến hạn"
        >
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-ink">Ôn đến hạn</h3>
            <p className="text-sm leading-6 text-slate">
              Hiện có{" "}
              <span className="font-mono font-semibold text-ink">
                {dueCount}
              </span>{" "}
              câu đến hạn ôn trên tổng số{" "}
              <span className="font-mono font-semibold text-ink">
                {summary.totalSeenItems}
              </span>{" "}
              câu từng gặp ({summary.totalSubmissions} lần nộp).
            </p>
            <p className="text-xs leading-5 text-slate">
              Mỗi phiên ôn ngắn lấy tối đa {SHORT_SESSION_MAX_ITEMS} câu, ưu
              tiên câu đến hạn rồi đến câu chưa học.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="button-primary"
              onClick={onStartDueReview}
            >
              Ôn đến hạn
            </button>
          </div>
        </section>

        <section
          className="panel learning-card flex flex-col justify-between space-y-4 p-4 sm:p-5"
          aria-label="Học theo chủ đề"
        >
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-ink">
              Học theo chủ đề
            </h3>
            <p className="text-sm leading-6 text-slate">
              Chọn một chủ đề NCSF để mở phiên luyện ngắn (tối đa{" "}
              {SHORT_SESSION_MAX_ITEMS} câu, ưu tiên câu đến hạn và câu chưa làm
              trong chủ đề đó).
            </p>
            <label className="field-label">
              Chủ đề muốn luyện
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {Object.entries(NCSF_DOMAINS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <button
              type="button"
              className="button-primary"
              onClick={() => onStartDomainStudy(selectedDomain)}
            >
              Học theo chủ đề
            </button>
          </div>
        </section>
      </div>

      <section
        className="panel learning-card space-y-4 p-4 sm:p-5"
        aria-label="Thống kê theo chủ đề"
      >
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-ink">
            Tổng hợp theo chủ đề
          </h3>
          <p className="text-xs leading-5 text-slate">
            Tỷ lệ đúng chỉ phản ánh kết quả trả lời câu hỏi trên trình duyệt
            này, không thay thế đánh giá năng lực nghề nghiệp của PT. Khoảng
            nghỉ ôn tập [1, 3, 7, 14, 30] ngày là quy ước sản phẩm dựa trên
            nguyên lý tự nhớ lại cách quãng ({" "}
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/21574747/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-cobalt underline"
            >
              Karpicke &amp; Blunt 2011 · PMID 21574747
            </a>{" "}
            · phạm vi: tóm tắt nghiên cứu · đối chiếu 2026-11-11), chưa phải
            lịch tối ưu đã kiểm chứng riêng cho PT.
          </p>
        </div>

        {!hydrated ? (
          <p className="text-sm text-slate" role="status">
            Đang tải thống kê tiến độ…
          </p>
        ) : summary.domains.length === 0 ? (
          <p className="text-sm text-slate">
            Chưa có lần nộp bài nào. Hãy hoàn thành một bài trong Đề cương ôn
            tập hoặc Đề thi thử để xem thống kê theo chủ đề.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-rule md:hidden">
              {summary.domains.map((domain) => (
                <li
                  key={domain.domain}
                  className="space-y-3 py-3 first:pt-0 last:pb-0"
                >
                  <h4 className="text-sm font-semibold text-ink">
                    {domain.label}
                  </h4>
                  <dl className="grid grid-cols-2 gap-3">
                    {DOMAIN_METRICS.map((metric) => (
                      <div key={metric.label} className="min-w-0">
                        <dt className="text-xs leading-5 text-slate">
                          {metric.label}
                        </dt>
                        <dd className="font-mono text-sm text-ink">
                          {metric.value(domain)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {domain.domain !== "unclassified" && (
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => onStartDomainStudy(domain.domain)}
                    >
                      Luyện chủ đề này
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="learning-table w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr>
                    <th scope="col" className="pb-2 pr-3 font-semibold">
                      Chủ đề
                    </th>
                    {DOMAIN_METRICS.map(({ label }) => (
                      <th key={label} scope="col" className="px-3 pb-2 font-semibold">
                        {label}
                      </th>
                    ))}
                    <th scope="col" className="pb-2 pl-3 font-semibold">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {summary.domains.map((domain) => (
                    <tr key={domain.domain}>
                      <td className="py-2.5 pr-3 font-medium text-ink">
                        {domain.label}
                      </td>
                      {DOMAIN_METRICS.map((metric) => (
                        <td key={metric.label} className="px-3 py-2.5 font-mono text-ink">
                          {metric.value(domain)}
                        </td>
                      ))}
                      <td className="py-2.5 pl-3">
                        {domain.domain !== "unclassified" && (
                          <button
                            type="button"
                            className="font-semibold text-cobalt underline"
                            onClick={() => onStartDomainStudy(domain.domain)}
                          >
                            Luyện chủ đề này
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="panel learning-card space-y-3 p-4 sm:p-5" aria-label="Tiến độ luyện tình huống">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">Luyện tình huống ({caseHistory.length} lần)</h3>
          <button type="button" className="button-secondary" onClick={onOpenCases}>Mở mục luyện</button>
        </div>
        {caseHistory.length === 0 ? (
          <p className="text-sm text-slate">Kết quả tình huống đã lưu sẽ hiện ở đây.</p>
        ) : (
          <ul className="divide-y divide-rule text-sm">
            {caseHistory.slice(0, 10).map((sub) => {
              const scenario = PT_CASES.find(({ id }) => id === sub.caseId);
              return (
                <li key={sub.id} className="space-y-1 py-2.5 first:pt-0 last:pb-0">
                  <p className="font-semibold text-ink">{scenario?.title ?? sub.caseId}</p>
                  <p className="text-slate">
                    Phiên bản {sub.caseVersion} · {formatLocalDateTime(sub.submittedAt)}
                    {scenario && scenario.version > sub.caseVersion && " · Có phiên bản mới"}
                  </p>
                  <p className="text-ink">
                    Đã xử lý {sub.evaluation.addressedCriterionIds.length} · Cần xem lại {sub.evaluation.revisitCriterionIds.length} · Chưa thực hành {sub.evaluation.unpracticedCriterionIds.length}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {ncsfHistory.length > 0 && (
        <section
          className="panel learning-card space-y-3 p-4 sm:p-5"
          aria-label="Lịch sử các lần nộp"
        >
          <h3 className="text-base font-semibold text-ink">
            Lịch sử lần nộp gần đây ({ncsfHistory.length})
          </h3>
          <ul className="divide-y divide-rule text-sm">
            {ncsfHistory.slice(0, 10).map((sub) => {
              const correctCount = sub.items.filter((i) => i.correct).length;
              return (
                <li
                  key={sub.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <span className="font-semibold text-ink">
                      {sub.source === "ncsf-mock"
                        ? "Đề thi thử"
                        : "Đề cương ôn tập"}
                    </span>
                    <span className="ml-2 text-slate">
                      · {formatLocalDateTime(sub.submittedAt)}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-ink">
                    Đúng {correctCount}/{sub.items.length} câu
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
