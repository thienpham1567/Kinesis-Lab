import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { createAppLoader } from "./lib/load-app-module.mjs";

const scrollRules = createAppLoader()("src/lib/chat/study-scroll.ts");

function setup() {
  const slots = [], effects = [];
  const requests = [];
  let cursor = 0, release;
  const gate = new Promise(resolve => { release = resolve; });
  const jsx = (type, props) => ({ type, props: props ?? {} });
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial; return [slots[i], value => { slots[i] = typeof value === "function" ? value(slots[i]) : value; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useId() { return `fixture-${cursor++}`; },
    useEffect(run, deps) { const i = cursor++; const old = slots[i]; if (!old || deps.some((d, j) => d !== old.deps[j])) effects.push(() => { old?.cleanup?.(); slots[i] = { deps, cleanup: run() }; }); },
  };
  const mocks = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/link": { default: "a" },
    "./WorkspaceUI": { Icon: "Icon" },
    "./ClinicalEvidencePanel": { ClinicalEvidencePanel: "Evidence" },
    "@/lib/clinical/evidence-assessment": { ASSISTANT_EVIDENCE: {} },
    "@/lib/chat/answer-citations": { answerCitationsFromEvidence: () => [] },
    "@/lib/clinical/anatomy-atlas": { ANATOMY_REGIONS: [], detectRegionsInText: () => [], matchClientIssuesToRegions: () => ({}) },
    "@/lib/clinical/safety": { safetyNotes: () => "" },
    "./JointDiagramSvg": { JointDiagramSvg: "Diagram" },
    "./MarkdownAnswer": { MarkdownAnswer: "Answer" },
    "@/lib/chat/study-scroll": scrollRules,
    "@/lib/ai/stream-events": { async *readNdjson() { yield { type: "token", text: "Fixture first chunk" }; await gate; yield { type: "token", text: " and second chunk" }; yield { type: "done" }; } },
  };
  const exports = {};
  const output = ts.transpileModule(readFileSync("src/components/ChatPanel.tsx", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(output, { exports, AbortController, console, fetch: async (url, options) => {
    requests.push({ url, method: options?.method ?? "GET" });
    return url === "/api/clients" ? { ok: true, json: async () => ({ clients: [] }) } : { ok: true, body: {} };
  }, require: id => { assert.ok(id in mocks, `Unexpected import ${id}`); return mocks[id]; } });
  const metrics = { scrollHeight: 2000, clientHeight: 400, scrollTop: 1600, calls: 0, focused: false, scrollTo({ top }) { this.scrollTop = top; this.calls++; }, focus() { this.focused = true; } };
  const render = () => {
    cursor = 0;
    const tree = exports.ChatPanel({});
    const log = find(tree, n => n.props.role === "log");
    log.props.ref.current = metrics;
    for (const run of effects.splice(0)) run();
    return tree;
  };
  return { render, metrics, release, requests };
}

test("consultation starters prepare an editable draft and focus without sending", async () => {
  const ui = setup();
  let tree = ui.render(); await tick(); tree = ui.render();
  const starter = find(tree, n => n.type === "button" && text(n).trim() === "Phân tích bài tập");
  assert.ok(starter, "An empty consultation needs an actionable draft starter");
  const textarea = find(tree, n => n.type === "textarea");
  let focused = false;
  textarea.props.ref.current = { focus() { focused = true; } };
  starter.props.onClick();
  tree = ui.render();
  assert.match(find(tree, n => n.type === "textarea").props.value, /bài tập/i);
  assert.equal(focused, true);
  assert.equal(find(tree, n => n.props.role === "log").props["aria-busy"], false);
  assert.equal(all(tree).filter(n => n.type === "article").length, 0, "A starter must not send a question");
  assert.equal(ui.requests.some(request => request.method !== "GET"), false, "Preparing a draft must not call the chat API");
  assert.equal(find(tree, n => n.type === "button" && text(n).trim() === "Phân tích bài tập"), undefined, "Existing drafts must not be replaced by starters");
});
function all(tree) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(all);
  return [tree, ...all(tree.props?.children)];
}
function text(tree) {
  if (tree == null || typeof tree === "boolean") return "";
  if (typeof tree !== "object") return String(tree);
  if (Array.isArray(tree)) return tree.map(text).join(" ");
  return text(tree.props?.children);
}
function find(tree, predicate) { return all(tree).find(predicate); }
const tick = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
async function begin(ui) {
  let tree = ui.render(); await tick();
  find(tree, n => n.type === "textarea").props.onChange({ target: { value: "Synthetic UI question" } });
  tree = ui.render();
  find(tree, n => n.type === "form").props.onSubmit({ preventDefault() {} });
  await tick();
  return ui.render();
}

test("a reader above the bottom keeps their place as consultation tokens arrive", async () => {
  const ui = setup();
  let tree = await begin(ui);
  const log = find(tree, n => n.props.role === "log");
  assert.equal(typeof log.props.onScroll, "function", "Conversation must observe reader position");
  ui.metrics.scrollTop = 400;
  log.props.onScroll({ currentTarget: ui.metrics });
  ui.release(); await tick(); tree = ui.render();
  assert.equal(ui.metrics.scrollTop, 400);
  assert.ok(find(tree, n => n.type === "button" && text(n).includes("Đến nội dung mới nhất")));
});

test("a pinned reader follows the post-render message height", async () => {
  const ui = setup();
  await begin(ui);
  ui.metrics.scrollHeight = 2400;
  const before = ui.metrics.calls;
  ui.release(); await tick(); ui.render();
  assert.ok(ui.metrics.calls > before);
  assert.equal(ui.metrics.scrollTop, 2400);
});

test("explicit catch-up restores following and does not lose keyboard focus", async () => {
  const ui = setup(); let tree = await begin(ui);
  ui.metrics.scrollTop = 300;
  const log = find(tree, n => n.props.role === "log");
  assert.equal(typeof log.props.onScroll, "function");
  log.props.onScroll({ currentTarget: ui.metrics });
  ui.release(); await tick(); tree = ui.render();
  const catchUp = find(tree, n => n.type === "button" && text(n).includes("Đến nội dung mới nhất"));
  assert.ok(catchUp);
  catchUp.props.onClick(); tree = ui.render();
  assert.equal(ui.metrics.scrollTop, ui.metrics.scrollHeight);
  assert.equal(ui.metrics.focused, true);
  assert.equal(find(tree, n => n.type === "button" && text(n).includes("Đến nội dung mới nhất")), undefined);
});
