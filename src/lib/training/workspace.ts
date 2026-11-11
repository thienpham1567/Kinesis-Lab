import {
  createProgramDraft,
  createWorkoutInput,
  validateProgramDraft,
  validateWorkoutInput,
  type ExercisePrescription,
  type ProgramDraft,
  type ProgramSession,
  type ProgramSourceContext,
  type TrainingPlan,
  type TrainingWorkout,
  type WorkoutInput,
} from "./program";

type Proposal = {
  program: ProgramDraft;
  source_context: ProgramSourceContext | null;
};
export type TrainingWorkspaceState = {
  clientId: string;
  draft: ProgramDraft;
  dirty: boolean;
  selectedPlanId: string | null;
  sourceContext: ProgramSourceContext | null;
  plans: TrainingPlan[];
  workouts: TrainingWorkout[];
  workout: WorkoutInput | null;
  prescription: ProgramSession | null;
  workoutDirty: boolean;
  workoutSaveError: string;
  proposal: Proposal | null;
  loading: boolean;
  loaded: boolean;
  busy: "save" | "ai" | "status" | "workout" | null;
  error: string;
  loadError: string;
  notice: string;
  questions: string[];
};

/** Per-client, in-memory state. URL navigation never owns or resets the drafts. */
export class TrainingWorkspaceModel {
  private state: TrainingWorkspaceState;
  private listeners = new Set<() => void>();
  private controllers = new Set<AbortController>();
  private loadController: AbortController | null = null;
  private disposed = false;
  private savedDraft: string;
  constructor(
    clientId: string,
    private fetcher: typeof fetch = (...args) => globalThis.fetch(...args),
  ) {
    const draft = createProgramDraft();
    this.savedDraft = JSON.stringify(draft);
    this.state = {
      clientId,
      draft,
      dirty: false,
      selectedPlanId: null,
      sourceContext: null,
      plans: [],
      workouts: [],
      workout: null,
      prescription: null,
      workoutDirty: false,
      workoutSaveError: "",
      proposal: null,
      loading: true,
      loaded: false,
      busy: null,
      error: "",
      loadError: "",
      notice: "",
      questions: [],
    };
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private update(patch: Partial<TrainingWorkspaceState>) {
    if (this.disposed) return;
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
  // React development mode can set up an effect again after cleanup.
  resume() {
    this.disposed = false;
  }
  dispose() {
    this.disposed = true;
    this.loadController?.abort();
    for (const controller of this.controllers) controller.abort();
    this.controllers.clear();
  }
  private async request<T>(
    url: string,
    init: RequestInit,
    controller: AbortController,
  ): Promise<T> {
    this.controllers.add(controller);
    try {
      const response = await this.fetcher(url, {
        ...init,
        cache: "no-store",
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok) {
        const error = new Error(
          body.error || "Chưa hoàn tất yêu cầu. Hãy thử lại.",
        ) as Error & { questions?: string[] };
        error.questions = Array.isArray(body.questions) ? body.questions : [];
        throw error;
      }
      return body as T;
    } finally {
      this.controllers.delete(controller);
    }
  }
  async load() {
    this.loadController?.abort();
    const controller = new AbortController();
    this.loadController = controller;
    this.update({ loading: true, loadError: "" });
    try {
      const query = `?client_id=${encodeURIComponent(this.state.clientId)}`;
      const [plans, workouts] = await Promise.all([
        this.request<{ plans: TrainingPlan[] }>(
          `/api/training-plans${query}`,
          {},
          controller,
        ),
        this.request<{ workouts: TrainingWorkout[] }>(
          `/api/training-workouts${query}`,
          {},
          controller,
        ),
      ]);
      if (controller.signal.aborted) return;
      if (!Array.isArray(plans.plans) || !Array.isArray(workouts.workouts))
        throw new Error("Phản hồi dữ liệu chưa hợp lệ. Hãy tải lại.");
      this.update({
        plans: plans.plans,
        workouts: workouts.workouts,
        loaded: true,
      });
    } catch (error) {
      if (!controller.signal.aborted)
        this.update({
          loadError:
            error instanceof Error
              ? error.message
              : "Không tải được giáo án và buổi tập. Hãy thử lại.",
        });
    } finally {
      if (!controller.signal.aborted) this.update({ loading: false });
    }
  }
  editDraft(draft: ProgramDraft) {
    this.update({
      draft,
      dirty: JSON.stringify(draft) !== this.savedDraft,
      notice: "",
    });
  }
  selectPlan(plan: TrainingPlan, replace = false) {
    if (this.state.busy || (this.state.dirty && !replace)) return false;
    if (plan.client_id !== this.state.clientId) return false;
    const draft = structuredClone(plan.program);
    this.savedDraft = JSON.stringify(draft);
    this.update({
      draft,
      selectedPlanId: plan.id,
      sourceContext: plan.source_context,
      dirty: false,
      proposal: null,
      error: "",
      notice: `Đang xem phiên bản ${plan.revision}.`,
    });
    return true;
  }
  resetDraft(replace = false) {
    if (this.state.busy || (this.state.dirty && !replace)) return false;
    const draft = createProgramDraft();
    this.savedDraft = JSON.stringify(draft);
    this.update({
      draft,
      dirty: false,
      selectedPlanId: null,
      sourceContext: null,
      proposal: null,
      error: "",
      notice: "Đã mở bản mới chưa lưu.",
    });
    return true;
  }
  async saveDraft() {
    if (this.state.busy) return;
    this.update({ busy: "save", error: "", notice: "" });
    const controller = new AbortController();
    try {
      const program = validateProgramDraft(this.state.draft);
      const body = {
        client_id: this.state.clientId,
        program,
        base_plan_id: this.state.selectedPlanId ?? undefined,
        source_context: this.state.sourceContext,
      };
      const { plan } = await this.request<{ plan: TrainingPlan }>(
        "/api/training-plans",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        controller,
      );
      if (controller.signal.aborted) return;
      this.savedDraft = JSON.stringify(plan.program);
      this.update({
        plans: [plan, ...this.state.plans],
        draft: plan.program,
        selectedPlanId: plan.id,
        dirty: false,
        notice: `Đã lưu phiên bản ${plan.revision}. Chưa tự động áp dụng.`,
        sourceContext: plan.source_context,
      });
    } catch (error) {
      if (!controller.signal.aborted)
        this.update({
          error:
            error instanceof Error
              ? error.message
              : "Chưa lưu được. Bản nháp vẫn được giữ.",
        });
    } finally {
      if (!controller.signal.aborted) this.update({ busy: null });
    }
  }
  async propose() {
    if (this.state.busy) return;
    this.update({ busy: "ai", error: "", questions: [], notice: "" });
    const controller = new AbortController();
    try {
      const proposal = await this.request<Proposal>(
        "/api/training-plans/propose",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: this.state.clientId,
            draft: this.state.draft,
          }),
        },
        controller,
      );
      if (!controller.signal.aborted)
        this.update({
          proposal,
          notice: "Đề xuất đã sẵn sàng để xem. Bản đang soạn vẫn được giữ.",
        });
    } catch (error) {
      if (!controller.signal.aborted)
        this.update({
          error:
            error instanceof Error
              ? error.message
              : "Chưa tạo được đề xuất. Bạn có thể tiếp tục soạn thủ công.",
          questions:
            (error as Error & { questions?: string[] }).questions ?? [],
        });
    } finally {
      if (!controller.signal.aborted) this.update({ busy: null });
    }
  }
  applyProposal() {
    if (this.state.busy || !this.state.proposal) return;
    const { program, source_context } = this.state.proposal;
    this.update({
      draft: program,
      sourceContext: source_context,
      proposal: null,
      dirty: true,
      notice:
        "Đã đưa đề xuất vào trình soạn. Hãy kiểm tra và lưu phiên bản mới.",
    });
  }
  dismissProposal() {
    this.update({ proposal: null });
  }
  async setPlanStatus(plan: TrainingPlan, status: "active" | "archived") {
    if (this.state.busy || plan.client_id !== this.state.clientId) return;
    this.update({ busy: "status", error: "", notice: "" });
    const controller = new AbortController();
    try {
      const { plan: saved } = await this.request<{ plan: TrainingPlan }>(
        "/api/training-plans",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: this.state.clientId,
            plan_id: plan.id,
            status,
          }),
        },
        controller,
      );
      if (!controller.signal.aborted)
        this.update({
          plans: this.state.plans.map((p) =>
            p.id === saved.id
              ? saved
              : status === "active" && p.status === "active"
                ? { ...p, status: "archived" }
                : p,
          ),
          notice:
            status === "active"
              ? `Đã áp dụng phiên bản đã lưu ${saved.revision}.`
              : `Đã lưu trữ phiên bản ${saved.revision}.`,
        });
    } catch (error) {
      if (!controller.signal.aborted)
        this.update({
          error:
            error instanceof Error
              ? error.message
              : "Chưa đổi được trạng thái. Hãy thử lại.",
        });
    } finally {
      if (!controller.signal.aborted) this.update({ busy: null });
    }
  }
  startWorkout(
    plan: TrainingPlan,
    session: ProgramSession,
    date: string,
    replace = false,
  ) {
    if (this.state.busy || plan.client_id !== this.state.clientId) return false;
    const current = this.state.workout;
    if (
      current?.plan_id === plan.id &&
      current.session_id === session.id &&
      current.performedAt === date
    )
      return true;
    if (this.state.workoutDirty && !replace) return false;
    const existing = this.state.workouts.find(
      (w) =>
        w.plan_id === plan.id &&
        w.session_id === session.id &&
        w.performedAt === date,
    );
    if (existing) return this.openWorkout(existing, replace);
    this.update({
      workout: createWorkoutInput(plan, session, date),
      prescription: session,
      workoutDirty: false,
      workoutSaveError: "",
      error: "",
      notice: "Buổi tập mới chưa lưu. Ghi nhận từng hiệp thực tế.",
    });
    return true;
  }
  openWorkout(workout: TrainingWorkout, replace = false) {
    if (this.state.busy || workout.client_id !== this.state.clientId)
      return false;
    if (this.state.workout?.id === workout.id) return true;
    if (this.state.workoutDirty && !replace) return false;
    this.update({
      workout: structuredClone(workout),
      prescription: workout.prescription,
      workoutDirty: false,
      workoutSaveError: "",
      error: "",
      notice: "Đã mở lại bản ghi buổi tập.",
    });
    return true;
  }
  editWorkout(workout: WorkoutInput) {
    if (
      this.state.busy ||
      workout.client_id !== this.state.clientId ||
      workout.id !== this.state.workout?.id
    )
      return;
    this.update({ workout, workoutDirty: true, notice: "" });
  }
  async saveWorkout(complete: boolean) {
    if (this.state.busy || !this.state.workout || !this.state.prescription)
      return false;
    this.update({
      busy: "workout",
      workoutSaveError: "",
      error: "",
      notice: "",
    });
    const controller = new AbortController();
    try {
      const input = validateWorkoutInput(
        {
          ...this.state.workout,
          status: complete ? "completed" : "in_progress",
        },
        this.state.prescription,
      );
      const { workout } = await this.request<{ workout: TrainingWorkout }>(
        "/api/training-workouts",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
        controller,
      );
      if (controller.signal.aborted) return false;
      this.update({
        workout,
        prescription: workout.prescription,
        workouts: [
          workout,
          ...this.state.workouts.filter((w) => w.id !== workout.id),
        ],
        workoutDirty: false,
        notice: complete
          ? "Đã lưu buổi tập hoàn thành."
          : "Đã lưu tiến độ buổi tập.",
      });
      return true;
    } catch (error) {
      if (!controller.signal.aborted)
        this.update({
          workoutSaveError:
            error instanceof Error
              ? error.message
              : "Chưa lưu được buổi tập. Số liệu vẫn được giữ để thử lại.",
        });
      return false;
    } finally {
      if (!controller.signal.aborted) this.update({ busy: null });
    }
  }
}

export function previousExerciseResult(
  exercise: ExercisePrescription,
  workouts: TrainingWorkout[],
  currentId: string | null,
  beforeDate: string,
) {
  for (const workout of [...workouts].sort((a, b) =>
    b.performedAt.localeCompare(a.performedAt),
  )) {
    if (
      workout.id === currentId ||
      workout.status !== "completed" ||
      workout.performedAt > beforeDate
    )
      continue;
    const previous = workout.prescription.exercises.find(
      (e) =>
        e.name.trim().toLocaleLowerCase() ===
          exercise.name.trim().toLocaleLowerCase() &&
        e.exerciseId === exercise.exerciseId,
    );
    if (!previous) continue;
    const sets = workout.sets.filter(
      (s) =>
        s.exerciseId === previous.id &&
        s.completed &&
        s.loadUnit === exercise.loadUnit,
    );
    if (sets.length) return { workout, sets };
  }
  return null;
}
