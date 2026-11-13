"use client";

import { useState } from "react";
import { TeachingLaunchButton } from "../teaching/TeachingLaunchButton";
import { createSessionTeachingView } from "@/lib/training/teaching-view";
import { ProgramPreview } from "./ProgramPreview";
import { ProgramSessionEditor } from "./ProgramSessionEditor";
import {
  createProgramSession,
  GOAL_LABELS,
  PLAN_STATUS_LABELS,
  type ProgramDraft,
  type ProgramSession,
  type TrainingGoal,
  type TrainingPlan,
} from "@/lib/training/program";
import type {
  TrainingWorkspaceModel,
  TrainingWorkspaceState,
} from "@/lib/training/workspace";
import { NumberField, ProgramField, ProgramSources } from "./ProgramFields";

function SavedSessionTeaching({ plan, dirty, disabled }: {
  plan: TrainingPlan;
  dirty: boolean;
  disabled: boolean;
}) {
  const [selected, setSelected] = useState(plan.program.sessions[0]?.id ?? "");
  const session = plan.program.sessions.find(({ id }) => id === selected);
  return (
    <div className="mb-5 grid items-end gap-3 border-b border-rule pb-5 sm:grid-cols-[minmax(0,1fr)_auto]">
      <ProgramField label={`Buổi để trình bày · phiên bản ${plan.revision}`}>
        <select value={selected} onChange={(event) => setSelected(event.target.value)} disabled={disabled}>
          {plan.program.sessions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </ProgramField>
      <TeachingLaunchButton disabled={disabled || !session}
        getView={() => session ? createSessionTeachingView({
          kind: "plan", planId: plan.id, revision: plan.revision, sessionId: session.id,
        }, session) : null}>
        Trình bày buổi đã lưu
      </TeachingLaunchButton>
      {dirty && <p className="text-sm text-slate sm:col-span-2">Trình bày lấy phiên bản {plan.revision} đã lưu. Lưu bản đang soạn nếu muốn dùng nội dung mới.</p>}
    </div>
  );
}

export function ProgramEditor({
  model,
  state,
}: {
  model: TrainingWorkspaceModel;
  state: TrainingWorkspaceState;
}) {
  const [replacement, setReplacement] = useState<string | null>(null);
  const [applyConfirm, setApplyConfirm] = useState(false);
  const draft = state.draft;
  const selected = state.plans.find((p) => p.id === state.selectedPlanId);
  const change = (patch: Partial<ProgramDraft>) =>
    model.editDraft({ ...draft, ...patch });
  const changeSession = (session: ProgramSession) =>
    change({
      sessions: draft.sessions.map((s) => (s.id === session.id ? session : s)),
    });
  function chooseVersion(id: string) {
    const plan = state.plans.find((p) => p.id === id);
    const changed = plan ? model.selectPlan(plan) : model.resetDraft();
    if (!changed) setReplacement(id);
  }
  function confirmReplacement() {
    const plan = state.plans.find((p) => p.id === replacement);
    if (plan) model.selectPlan(plan, true);
    else model.resetDraft(true);
    setReplacement(null);
  }
  return (
    <section
      className="panel min-w-0 p-5 sm:p-6"
      aria-label="Soạn chương trình tập luyện"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-5">
        <div>
          <h2 className="text-lg font-bold text-ink">Chương trình tập luyện</h2>
          <p className="mt-1 text-xs leading-6 text-slate">
            Soạn thủ công hoặc yêu cầu AI đề xuất, kiểm tra rồi lưu từng phiên
            bản.
          </p>
        </div>
        <span className="badge bg-surface text-ink">
          {state.dirty
            ? "Có thay đổi chưa lưu"
            : selected
              ? `Phiên bản ${selected.revision} đã lưu`
              : "Bản mới chưa lưu"}
        </span>
      </div>
      <div className="my-5 flex flex-wrap items-end gap-3">
        <div className="min-w-0 basis-full sm:flex-1">
          <ProgramField label="Mở phiên bản để xem / tái sử dụng">
            <select
              value={state.selectedPlanId ?? ""}
              disabled={!!state.busy}
              onChange={(e) => chooseVersion(e.target.value)}
            >
              <option value="">Bản mới</option>
              {state.plans.map((p) => (
                <option key={p.id} value={p.id}>
                  v{p.revision} · {p.program.title} ·{" "}
                  {PLAN_STATUS_LABELS[p.status]}
                </option>
              ))}
            </select>
          </ProgramField>
        </div>
        <button
          type="button"
          className="button-secondary"
          disabled={!!state.busy}
          onClick={() => chooseVersion("")}
        >
          Soạn bản mới
        </button>
      </div>
      {replacement !== null && (
        <div
          className="mb-5 rounded-xl border border-caution/30 bg-caution-soft p-4 text-sm text-ink"
          role="alert"
        >
          <p>
            Thay bản đang soạn? Các thay đổi chưa lưu sẽ bị bỏ. Bạn có thể hủy
            để lưu trước.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="button-secondary"
              type="button"
              onClick={() => setReplacement(null)}
            >
              Giữ bản đang soạn
            </button>
            <button
              className="button-secondary"
              type="button"
              onClick={confirmReplacement}
            >
              Bỏ thay đổi và mở bản đã chọn
            </button>
          </div>
        </div>
      )}
      {selected ? (
        <SavedSessionTeaching key={selected.id} plan={selected} dirty={state.dirty} disabled={!!state.busy} />
      ) : (
        <p className="mb-5 border-b border-rule pb-4 text-sm text-slate">Chọn hoặc lưu phiên bản giáo án để trình bày một buổi.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void model.saveDraft();
        }}
      >
        <fieldset
          disabled={!!state.busy}
          className="min-w-0 space-y-6 disabled:opacity-70"
        >
          <legend className="sr-only">Thiết lập chương trình</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProgramField label="Tên chương trình">
              <input
                value={draft.title}
                maxLength={160}
                onChange={(e) => change({ title: e.target.value })}
                required
              />
            </ProgramField>
            <ProgramField label="Mục tiêu tập luyện">
              <select
                value={draft.goal}
                onChange={(e) =>
                  change({ goal: e.target.value as TrainingGoal })
                }
              >
                {Object.entries(GOAL_LABELS).map(([goal, label]) => (
                  <option key={goal} value={goal}>
                    {label}
                  </option>
                ))}
              </select>
            </ProgramField>
            <ProgramField label="Ngày xem lại">
              <input
                type="date"
                value={draft.reviewDate ?? ""}
                onChange={(e) => change({ reviewDate: e.target.value || null })}
              />
            </ProgramField>
            <NumberField
              label="Thời lượng chương trình (tuần)"
              value={draft.weeks}
              min={1}
              max={104}
              onChange={(n) => change({ weeks: n ?? 1 })}
            />
            <NumberField
              label="Thời gian mỗi buổi (phút)"
              value={draft.sessionMinutes}
              min={1}
              max={360}
              onChange={(n) => change({ sessionMinutes: n ?? 1 })}
            />
            <ProgramField label="Thiết bị có sẵn">
              <input
                value={draft.equipment}
                maxLength={2000}
                onChange={(e) => change({ equipment: e.target.value })}
              />
            </ProgramField>
            <ProgramField label="Chi tiết mục tiêu">
              <textarea
                value={draft.goalDetail}
                maxLength={2000}
                onChange={(e) => change({ goalDetail: e.target.value })}
              />
            </ProgramField>
            <ProgramField label="Giới hạn và điều cần làm rõ">
              <textarea
                value={draft.constraints}
                maxLength={4000}
                onChange={(e) => change({ constraints: e.target.value })}
              />
            </ProgramField>
            <ProgramField label="Lý do lựa chọn">
              <textarea
                value={draft.rationale}
                maxLength={4000}
                onChange={(e) => change({ rationale: e.target.value })}
              />
            </ProgramField>
          </div>
          <div className="border-t border-rule pt-5">
            <h3 className="text-sm font-semibold text-ink">
              Lịch tuần và chỉ định từng bài
            </h3>
            <p className="mt-1 text-xs leading-6 text-slate">
              Giá trị ban đầu là thiết lập có thể sửa, không phải hướng dẫn liều
              tập an toàn. Nhóm superset cần ít nhất hai bài trong cùng buổi.
            </p>
          </div>
          {draft.sessions.map((session, index) => (
            <ProgramSessionEditor
              key={session.id}
              session={session}
              index={index}
              onChange={changeSession}
              onRemove={() =>
                change({
                  sessions: draft.sessions.filter((s) => s.id !== session.id),
                })
              }
              canRemove={draft.sessions.length > 1}
            />
          ))}
          <button
            type="button"
            className="button-secondary"
            disabled={draft.sessions.length >= 7}
            onClick={() => {
              const day = Array.from({ length: 7 }, (_, i) => i).find(
                (day) => !draft.sessions.some((s) => s.weekday === day),
              );
              change({
                sessions: [...draft.sessions, createProgramSession(day ?? 1)],
              });
            }}
          >
            Thêm buổi tập
          </button>
          <ProgramField label="Quy tắc tiến triển và điều chỉnh">
            <textarea
              rows={3}
              value={draft.progression}
              maxLength={4000}
              onChange={(e) => change({ progression: e.target.value })}
            />
          </ProgramField>
          <div className="flex flex-wrap gap-3 border-t border-rule pt-5">
            <button type="submit" className="button-primary">
              {state.busy === "save" ? "Đang lưu…" : "Lưu phiên bản mới"}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                void model.propose();
              }}
            >
              {state.busy === "ai" ? "Đang tạo đề xuất…" : "Đề xuất với AI"}
            </button>
          </div>
        </fieldset>
      </form>
      {state.proposal && (
        <div className="mt-6 border-t border-rule pt-5">
          <h3 className="text-base font-semibold text-ink">
            Đề xuất AI · {state.proposal.program.title}
          </h3>
          <ProgramPreview program={state.proposal.program} />
          <div className="mt-4">
            <ProgramSources context={state.proposal.source_context} />
          </div>
          {applyConfirm ? (
            <div className="mt-4 rounded-xl border border-caution/30 bg-caution-soft p-4 text-sm text-ink">
              <p>
                Đưa đề xuất vào trình soạn sẽ thay bản đang soạn. Đề xuất chưa
                được lưu hoặc áp dụng.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setApplyConfirm(false)}
                >
                  Giữ bản đang soạn
                </button>
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => {
                    model.applyProposal();
                    setApplyConfirm(false);
                  }}
                >
                  Thay bằng đề xuất để chỉnh sửa
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="button-secondary"
                disabled={!!state.busy}
                onClick={() => setApplyConfirm(true)}
              >
                Dùng đề xuất để chỉnh sửa…
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => model.dismissProposal()}
              >
                Bỏ đề xuất
              </button>
            </div>
          )}
        </div>
      )}
      <div className="mt-6">
        <ProgramSources context={state.sourceContext} />
      </div>
      {selected && (
        <div className="mt-5 border-t border-rule pt-5 text-sm text-ink">
          <p>
            Phiên bản đã lưu v{selected.revision} ·{" "}
            {PLAN_STATUS_LABELS[selected.status]}.{" "}
            {state.dirty &&
              "Thay đổi chưa lưu ở trên chưa thuộc phiên bản này. Hãy lưu phiên bản mới để áp dụng các thay đổi."}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className="button-secondary"
              disabled={
                !!state.busy || selected.status === "active" || state.dirty
              }
              onClick={() => {
                void model.setPlanStatus(selected, "active");
              }}
            >
              Áp dụng phiên bản đã lưu v{selected.revision}
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={!!state.busy || selected.status === "archived"}
              onClick={() => {
                void model.setPlanStatus(selected, "archived");
              }}
            >
              Lưu trữ v{selected.revision}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
