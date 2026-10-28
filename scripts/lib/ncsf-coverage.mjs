// Counts references and preserves explicit semantic limits; never infers mastery.
export function buildNcsfCoverage(objectives, map, chapters, examLabels, notes = []) {
  const inventory = new Map(objectives.map(o => [o.id, o]));
  if (inventory.size !== objectives.length) throw new Error("Duplicate objective ID");
  const refs = new Map(objectives.map(o => [o.id, new Set()]));
  const chapterMap = new Map(chapters.map(c => [String(c.ch), c.questions]));
  const statuses = new Map();
  for (const note of notes) {
    if (!inventory.has(note.id) || statuses.has(note.id)) throw new Error(`Unknown/duplicate objective note ${note.id}`);
    if (!["sampled", "partial", "source-gap"].includes(note.status) || typeof note.note !== "string" || !note.note.trim()) throw new Error(`Invalid semantic note ${note.id}`);
    statuses.set(note.id, note);
  }
  for (const [id, value] of Object.entries(map)) {
    if (!refs.has(id)) throw new Error(`Unknown mapped objective ${id}`);
    if (Array.isArray(value)) value.forEach(r => refs.get(id).add(r));
    else if (typeof value !== "string" || !value.startsWith("none:")) throw new Error(`Invalid map entry ${id}`);
  }
  for (const chapter of chapters) chapter.questions.forEach((q, index) => {
    for (const id of q.obj ?? []) {
      if (!refs.has(id)) throw new Error(`Unknown question objective ${id} on ch${chapter.ch}#${index + 1}`);
      refs.get(id).add(`ch${chapter.ch}#${index + 1}`);
    }
  });
  function exists(ref) {
    const app = typeof ref === "string" && ref.match(/^ch([1-8])#([1-9]\d*)$/);
    if (app) return Number(app[2]) <= (chapterMap.get(app[1])?.length ?? 0);
    const exam = typeof ref === "string" && ref.match(/^E([12])-([1-9]\d*)$/);
    return Boolean(exam && examLabels[Number(exam[1]) - 1].has(exam[2]));
  }
  const rows = objectives.map(o => {
    const all = [...refs.get(o.id)];
    for (const ref of all) if (!exists(ref)) throw new Error(`${o.id}: unknown/invalid reference ${ref}`);
    const app = all.filter(r => r.startsWith("ch"));
    const own = app.filter(r => r.startsWith(`ch${o.ch}#`));
    const other = app.filter(r => !r.startsWith(`ch${o.ch}#`));
    const exam = all.filter(r => r.startsWith("E"));
    const legacyReason = typeof map[o.id] === "string" ? map[o.id].replace(/^none:\s*/, "") : "";
    const semantic = statuses.get(o.id);
    return { ...o, app, own, other, exam, status: semantic?.status ?? (app.length ? "partial" : "source-gap"),
      note: semantic?.note ?? (legacyReason || "Chưa có đánh giá ngữ nghĩa chi tiết; dẫn chiếu không chứng minh phủ hết mục tiêu.") };
  });
  return { rows, totals: {
    objectives: rows.length, anyApp: rows.filter(r => r.app.length).length, own: rows.filter(r => r.own.length).length,
    crossOnly: rows.filter(r => r.app.length && !r.own.length).length,
    examOnly: rows.filter(r => !r.app.length && r.exam.length).length, noApp: rows.filter(r => !r.app.length).length,
    sourceGaps: rows.filter(r => r.status === "source-gap").length,
  } };
}
