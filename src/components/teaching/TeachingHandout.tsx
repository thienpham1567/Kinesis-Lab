import {
  teachingOriginLabel,
  type TeachingView,
} from "@/lib/training/teaching-view";
import { TeachingExercise } from "./TeachingExercise";

export function TeachingHandout({ view }: { view: TeachingView }) {
  return (
    <article
      className="teaching-handout space-y-6 bg-sheet p-4 text-ink sm:p-7"
      aria-label="Bản xem trước để in"
    >
      <header className="space-y-1 border-b border-rule pb-4">
        <h2 className="wrap-anywhere text-2xl font-bold text-ink">
          {view.title}
        </h2>
        <p className="text-sm text-slate">{teachingOriginLabel(view.origin)}</p>
      </header>
      {view.personalReminder.trim() && (
        <section className="teaching-instruction-block space-y-1">
          <h3 className="font-semibold">Lời nhắc riêng</h3>
          <p className="whitespace-pre-wrap wrap-anywhere">
            {view.personalReminder.trim()}
          </p>
        </section>
      )}
      {view.exercises.length === 0 && (
        <p>Buổi này chưa có bài tập trong bản đã lưu.</p>
      )}
      {view.exercises.map((exercise) => (
        <TeachingExercise
          key={exercise.id}
          exercise={exercise}
          showName={view.origin.kind !== "exercise"}
          handout
        />
      ))}
    </article>
  );
}
