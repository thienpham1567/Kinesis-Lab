"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  type Ref,
} from "react";
import {
  mockAnsweredCount,
  mockQuestionText,
  mockOptionText,
  shuffleMockExam,
  type NcsfMockOrder,
  NCSF_MOCK_SOURCES,
  parseNcsfMockExams,
  type NcsfMockBank,
  type NcsfMockImage,
} from "@/lib/ncsf-mock-exams";

function MockImage({
  exam,
  position,
  image,
}: {
  exam: number;
  position: number;
  image: NcsfMockImage;
}) {
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <figure className="my-3 min-w-0 max-w-full overflow-hidden rounded-lg border border-rule bg-sheet">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-3 py-2 text-sm">
        <span>Hình gốc của câu hỏi</span>
        <button
          type="button"
          className="button-secondary min-h-10"
          aria-pressed={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Thu nhỏ hình" : "Phóng to hình"}
        </button>
      </figcaption>
      {failed ? (
        <div className="space-y-2 p-4 text-sm" role="alert">
          <p>Không tải được hình. Hãy tải lại hình trước khi trả lời.</p>
          <button
            type="button"
            className="button-secondary"
            onClick={() => setFailed(false)}
          >
            Tải lại hình
          </button>
        </div>
      ) : (
        <div
          className="max-h-[40rem] min-w-0 overflow-auto p-3"
          tabIndex={0}
          aria-label="Khung hình có thể cuộn"
        >
          <Image
            unoptimized
            loading="lazy"
            src={`/api/ncsf/mock-image?exam=${exam}&question=${position}&image=${image.index}`}
            alt={image.alt || `Hình nguồn của câu ở vị trí ${position}`}
            width={image.width}
            height={image.height}
            onError={() => setFailed(true)}
            className={
              expanded
                ? "h-auto w-[60rem] max-w-none"
                : "mx-auto h-auto max-h-[32rem] w-auto max-w-full object-contain"
            }
          />
        </div>
      )}
    </figure>
  );
}

export type NcsfMockExamsHandle = { reshuffle: () => void };

export function NcsfMockExams({
  apiRef,
}: {
  apiRef?: Ref<NcsfMockExamsHandle>;
}) {
  const [bank, setBank] = useState<NcsfMockBank | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [active, setActive] = useState(1);
  const [answers, setAnswers] = useState<
    Record<number, Record<number, number>>
  >({ 1: {}, 2: {} });
  const [orders, setOrders] = useState<Record<number, NcsfMockOrder>>({});
  const [finished, setFinished] = useState<Record<number, boolean>>({});
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ncsf/mock-exams", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok)
          throw new Error(
            r.status === 401
              ? "Phiên truy cập đã hết hạn. Hãy đăng nhập lại thư viện."
              : "Không tải được đề thi thử.",
          );
        const data = parseNcsfMockExams(await r.json());
        if (!data) throw new Error("Dữ liệu đề thi chưa đầy đủ.");
        if (!controller.signal.aborted) {
          setOrders(
            Object.fromEntries(
              data.exams.map((e) => [e.id, shuffleMockExam(e)]),
            ),
          );
          setBank(data);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error ? e.message : "Không tải được đề thi thử.",
          );
      });
    return () => controller.abort();
  }, [reload]);
  const reshuffle = useCallback(
    (examId?: number) => {
      if (!bank) return;
      const updated = Object.fromEntries(
        bank.exams
          .filter((e) => examId === undefined || e.id === examId)
          .map((e) => [e.id, shuffleMockExam(e, orders[e.id])]),
      );
      setOrders({ ...orders, ...updated });
    },
    [bank, orders],
  );
  useImperativeHandle(apiRef, () => ({ reshuffle }), [reshuffle]);
  if (error)
    return (
      <div className="space-y-3" role="alert">
        <p>{error}</p>
        <button
          className="button-secondary"
          onClick={() => {
            setError("");
            setReload((v) => v + 1);
          }}
        >
          Thử lại
        </button>
      </div>
    );
  if (!bank || !orders[active])
    return (
      <p className="text-sm text-slate" role="status">
        Đang tải hai bộ đề thi thử…
      </p>
    );
  const exam = bank.exams[active - 1];
  const order = orders[active];
  const selections = answers[active];
  const count = mockAnsweredCount(exam, selections);
  const done = !!finished[active];
  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap gap-2" aria-label="Chọn bộ đề thi thử">
        {bank.exams.map((e) => (
          <button
            key={e.id}
            type="button"
            className="tab-button"
            aria-pressed={active === e.id}
            onClick={() => {
              reshuffle(e.id);
              setActive(e.id);
            }}
          >
            Bộ đề {e.id} · {e.questions.length} câu
          </button>
        ))}
      </div>
      <div className="space-y-2 text-sm text-slate">
        <h2 className="text-lg font-semibold text-ink">
          Đề thi thử NCSF · Bộ {active}
        </h2>
        <p>
          Câu hỏi và lựa chọn được xáo trộn mỗi lần mở đề. Nội dung và hình giữ
          nguyên từ đề gốc. Đối chiếu ngày{" "}
          {bank.checkedAt.split("-").reverse().join("/")}.
        </p>
        <p>Chưa có khóa đáp án chính thức; bài này chưa chấm đúng/sai.</p>
        <a
          className="font-semibold text-cobalt underline underline-offset-4"
          href={NCSF_MOCK_SOURCES[active - 1]}
          target="_blank"
          rel="noreferrer"
        >
          Mở đề gốc NCSF
        </a>
      </div>
      <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rule bg-sheet p-3 shadow-sm">
        <p className="text-sm font-semibold text-ink" role="status">
          {done ? "Đã hoàn thành" : "Đã trả lời"} · {count}/150 câu
        </p>
        {done ? (
          <button
            type="button"
            className="button-secondary"
            onClick={(event) => {
              // This node becomes the submit control after reset; cancel the original click first.
              event.preventDefault();
              reshuffle(active);
              setAnswers((v) => ({ ...v, [active]: {} }));
              setFinished((v) => ({ ...v, [active]: false }));
            }}
          >
            Làm lại bộ đề {active}
          </button>
        ) : (
          <button
            type="submit"
            form={`ncsf-mock-${active}`}
            className="button-primary"
          >
            Hoàn thành bài
          </button>
        )}
      </div>
      {done && (
        <p
          className="rounded-lg border border-rule bg-surface p-3 text-sm"
          role="status"
        >
          Bạn đã trả lời {count}/150 câu, còn {150 - count} câu chưa trả lời.
          Các lựa chọn của bạn được giữ bên dưới để xem lại.
        </p>
      )}
      <form
        id={`ncsf-mock-${active}`}
        onSubmit={(e) => {
          e.preventDefault();
          setFinished((v) => ({ ...v, [active]: true }));
        }}
        className="space-y-5"
      >
        {order.questions.map((sourceIndex, displayIndex) => {
          const q = exam.questions[sourceIndex];
          return (
            <fieldset
              key={`${active}-${q.position}`}
              data-position={q.position}
              data-source-title={q.title}
              className="min-w-0 rounded-lg border border-rule px-4 pb-4 pt-2 sm:px-5"
            >
              <legend className="max-w-full whitespace-pre-wrap break-words px-1 text-sm font-semibold leading-6 text-ink">
                Câu {displayIndex + 1}: {mockQuestionText(q.title)}
              </legend>
              {q.images.map((image) => (
                <MockImage
                  key={`${active}-${q.position}-${image.index}`}
                  exam={active}
                  position={q.position}
                  image={image}
                />
              ))}
              <div className="mt-2 space-y-1">
                {order.options[sourceIndex].map(
                  (optionIndex, displayOptionIndex) => (
                    <label
                      key={optionIndex}
                      className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2 py-3 text-sm leading-6 ${selections[sourceIndex] === optionIndex ? "bg-cobalt-soft text-ink" : "text-ink hover:bg-surface"}`}
                    >
                      <input
                        type="radio"
                        disabled={done}
                        className="mt-1 shrink-0 accent-cobalt"
                        name={`mock-${active}-${q.position}`}
                        value={optionIndex}
                        checked={selections[sourceIndex] === optionIndex}
                        onChange={() =>
                          setAnswers((v) => ({
                            ...v,
                            [active]: {
                              ...v[active],
                              [sourceIndex]: optionIndex,
                            },
                          }))
                        }
                      />
                      <span className="min-w-0 whitespace-pre-wrap break-words">
                        {String.fromCharCode(65 + displayOptionIndex)}.{" "}
                        {mockOptionText(q.options[optionIndex])}
                      </span>
                    </label>
                  ),
                )}
              </div>
              {done && selections[sourceIndex] === undefined && (
                <p className="mt-2 text-sm text-slate">Chưa trả lời</p>
              )}
            </fieldset>
          );
        })}
        {!done && (
          <button type="submit" className="button-primary">
            Hoàn thành bài
          </button>
        )}
      </form>
    </div>
  );
}
