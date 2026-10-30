import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

// Exercise the real component handlers with synthetic data and no browser/network.
// This narrow hook harness does not replace a browser test of React reconciliation.
function fixture({ quizResponses = [], sessionResponses = [] } = {}) {
  let active;
  let random = () => 0;
  const requests = [];
  const element = (type, props, key = null) => ({ type, props: props ?? {}, key });
  const stub = () => null;
  const hooks = {
    useState(initial) {
      const owner = active;
      const index = owner.cursor++;
      if (!(index in owner.slots)) owner.slots[index] = typeof initial === "function" ? initial() : initial;
      return [owner.slots[index], value => { owner.slots[index] = typeof value === "function" ? value(owner.slots[index]) : value; }];
    },
    useRef(initial) {
      return hooks.useState(() => ({ current: initial }))[0];
    },
    useEffect(effect, deps) {
      const owner = active;
      const index = owner.cursor++;
      const previous = owner.slots[index];
      if (!previous || !deps || deps.some((value, i) => !Object.is(value, previous.deps?.[i]))) {
        owner.pending.push(() => { previous?.cleanup?.(); owner.slots[index] = { deps, cleanup: effect() }; });
      }
    },
  };
  const responses = { "/api/ncsf/quiz": quizResponses, "/api/ncsf/session": sessionResponses };
  const mocks = {
    react: hooks,
    "react/jsx-runtime": { jsx: element, jsxs: element, Fragment: "fragment" },
    "next/dynamic": { default: () => stub, __esModule: true },
    "@/components/NcsfMockExams": { NcsfMockExams: stub },
    "@/components/NcsfCorrections": { NcsfPageCorrections: stub },
    "./NcsfCorrections": { NcsfSourceLinks: stub },
    "./NcsfQuestionFigure": { NcsfQuestionFigure: stub },
    "@/components/WorkspaceUI": { Icon: stub, PageHeading: stub },
  };
  const cache = new Map();
  function load(relative) {
    let file = path.resolve(relative);
    for (const extension of [".ts", ".tsx"]) if (!existsSync(file) && existsSync(file + extension)) file += extension;
    if (cache.has(file)) return cache.get(file);
    let source = readFileSync(file, "utf8");
    // Expose the existing internal composition for focused handler tests only.
    if (file.endsWith("/knowledge/page.tsx")) source += "\nexport { NcsfContent };\n";
    const output = ts.transpileModule(source, { fileName: file, reportDiagnostics: true, compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
    } });
    assert.equal(output.diagnostics?.length ?? 0, 0, `Syntax: ${file}`);
    const exports = {};
    cache.set(file, exports);
    const math = Object.create(Math);
    math.random = () => random();
    vm.runInNewContext(output.outputText, { exports, Math: math, AbortController, console,
      fetch: async (url, options) => {
        requests.push({ url, options });
        assert.ok(responses[url]?.length, `Unexpected network request: ${url}`);
        const response = responses[url].shift();
        if (response instanceof Error) throw response;
        return response;
      },
      require: target => Object.hasOwn(mocks, target) ? mocks[target] : target.startsWith("@/")
        ? load(path.resolve("src", target.slice(2))) : target.startsWith(".")
          ? load(path.resolve(path.dirname(file), target)) : require(target),
    }, { filename: file });
    return exports;
  }
  function mount(component, props = {}) {
    const instance = { slots: [], cursor: 0, pending: [], tree: null };
    return {
      render() {
        active = instance; instance.cursor = 0;
        instance.tree = component(props); active = undefined;
        for (const effect of instance.pending.splice(0)) effect();
        return instance.tree;
      },
      unmount() { for (const slot of instance.slots) slot?.cleanup?.(); },
    };
  }
  return { page: load("src/app/knowledge/page.tsx"), quiz: load("src/components/NcsfQuiz.tsx").NcsfQuiz,
    mount, requests, setRandom: value => { random = () => value; } };
}
const bank = () => ({ chapters: Array.from({ length: 8 }, (_, i) => ({ ch: i + 1,
  questions: [16, 18, 22].map((page, n) => ({ q: `Synthetic ${i + 1}.${n}`, options: ["One", "Two", "Three", "Four"],
    answer: 1, explain: "Synthetic explanation", page: i === 7 ? n + 1 : page, evidence: "Synthetic source" })),
})) });
const ok = value => ({ ok: true, status: 200, json: async () => value });
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function nodes(tree, predicate, route = "root") {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap((node, i) => nodes(node, predicate, `${route}.${i}`));
  return [...(predicate(tree) ? [{ node: tree, route }] : []), ...nodes(tree.props?.children, predicate, `${route}.children`)];
}
function text(tree) {
  if (tree == null || typeof tree === "boolean") return "";
  if (Array.isArray(tree)) return tree.map(text).join("");
  return typeof tree === "object" ? text(tree.props?.children) : String(tree);
}
const button = (tree, label) => nodes(tree, node => node.type === "button" && text(node) === label)[0]?.node;
const quizNode = (tree, quiz) => nodes(tree, node => node.type === quiz)[0];
const snapshot = tree => nodes(tree, node => ["legend", "label", "input", "select"].includes(node.type) || node.props?.role === "status")
  .map(({ node }) => ({ type: node.type, text: text(node), checked: node.props.checked, disabled: node.props.disabled, value: node.props.value,
    options: node.type === "input" ? node.props.name : undefined }));

test("citation navigation retains the quiz subtree, identity and explicit way back", () => {
  const f = fixture(); const parent = f.mount(f.page.NcsfContent, { heading: null });
  let tree = parent.render();
  assert.equal(quizNode(tree, f.quiz), undefined, "do not load private questions until requested");
  button(tree, "Đề thi nhỏ").props.onClick(); tree = parent.render();
  const first = quizNode(tree, f.quiz); assert.ok(first);
  first.node.props.onOpenPage("02-giai-phau-chuc-nang", 18); tree = parent.render();
  const reading = quizNode(tree, f.quiz);
  assert.ok(reading, "citation must hide the quiz instead of unmounting it");
  assert.equal(reading.route, first.route); assert.equal(reading.node.key, first.node.key);
  assert.ok(button(tree, "Quay lại bài đang làm"), "citation has a discoverable return action");
  button(tree, "Quay lại bài đang làm").props.onClick(); tree = parent.render();
  const resumed = quizNode(tree, f.quiz);
  assert.equal(resumed.route, first.route); assert.equal(resumed.node.key, first.node.key);
  button(tree, "Đọc giáo trình").props.onClick(); tree = parent.render();
  button(tree, "Đề thi nhỏ").props.onClick(); tree = parent.render();
  assert.equal(quizNode(tree, f.quiz).node.key, first.node.key, "tabs must not create a new attempt");
});

test("checking a citation preserves scored answers, chapter, lesson and order; explicit retry reshuffles", async () => {
  const f = fixture({ quizResponses: [ok(bank())] }); const citations = [];
  const quiz = f.mount(f.quiz, { onOpenPage: (...args) => citations.push(args) });
  quiz.render(); await settle(); let tree = quiz.render();
  button(tree, "Chương 2").props.onClick(); tree = quiz.render();
  nodes(tree, node => node.type === "select")[0].node.props.onChange({ target: { value: "1" } }); tree = quiz.render();
  nodes(tree, node => node.type === "input")[0].node.props.onChange(); tree = quiz.render();
  button(tree, "Nộp bài (1/3)").props.onClick(); tree = quiz.render();
  const before = snapshot(tree); const originalOrder = nodes(tree, node => node.type === "legend").map(({ node }) => text(node));
  const originalOptions = nodes(tree, node => node.type === "label" && nodes(node, child => child.type === "input").length).map(({ node }) => text(node));
  button(tree, "Xem trang 18").props.onClick(); tree = quiz.render();
  assert.deepEqual(citations, [["02-giai-phau-chuc-nang", 18]]);
  assert.deepEqual(snapshot(tree), before); assert.equal(f.requests.length, 1);
  f.setRandom(0.95); button(tree, "Làm lại tất cả").props.onClick(); tree = quiz.render();
  assert.notDeepEqual(nodes(tree, node => node.type === "legend").map(({ node }) => text(node)), originalOrder);
  assert.notDeepEqual(nodes(tree, node => node.type === "label" && nodes(node, child => child.type === "input").length).map(({ node }) => text(node)), originalOptions);
  assert.ok(nodes(tree, node => node.type === "input").every(({ node }) => !node.props.checked && !node.props.disabled));
  assert.equal(nodes(tree, node => node.type === "select")[0].node.props.value, 1);
});

test("quiz download failure offers a local retry without reloading the page", async () => {
  const f = fixture({ quizResponses: [new Error("offline"), ok(bank())] });
  const quiz = f.mount(f.quiz, { onOpenPage() {} }); quiz.render(); await settle(); let tree = quiz.render();
  const retry = button(tree, "Tải lại đề"); assert.ok(retry, "network failure must provide a retry");
  retry.props.onClick(); quiz.render(); await settle(); tree = quiz.render();
  assert.ok(button(tree, "Chương 1")); assert.equal(f.requests.length, 2);
});

test("expired quiz permission provides a login recovery action", async () => {
  let relogins = 0;
  const f = fixture({ quizResponses: [{ ok: false, status: 401 }] });
  const quiz = f.mount(f.quiz, { onOpenPage() {}, onSessionExpired() { relogins++; } });
  quiz.render(); await settle(); const tree = quiz.render();
  const login = button(tree, "Đăng nhập lại"); assert.ok(login); login.props.onClick();
  assert.equal(relogins, 1); assert.equal(nodes(tree, node => node.type === "input").length, 0);
});

test("retry-wrong starts a new attempt containing only missed question identities", async () => {
  const f = fixture({ quizResponses: [ok(bank())] });
  const quiz = f.mount(f.quiz, { onOpenPage() {} }); quiz.render(); await settle(); let tree = quiz.render();
  const correct = nodes(tree, node => node.type === "label" && text(node).endsWith("Two"))[0].node;
  nodes(correct, node => node.type === "input")[0].node.props.onChange(); tree = quiz.render();
  const completed = nodes(tree, node => node.type === "input" && node.props.checked)[0].node.props.name;
  button(tree, "Nộp bài (1/3)").props.onClick(); tree = quiz.render();
  assert.match(text(tree), /Kết quả: 1\/3 câu đúng/);
  f.setRandom(0.95); button(tree, "Làm lại 2 câu sai").props.onClick(); tree = quiz.render();
  const remaining = nodes(tree, node => node.type === "input");
  assert.equal(new Set(remaining.map(({ node }) => node.props.name)).size, 2);
  assert.ok(remaining.every(({ node }) => node.props.name !== completed && !node.props.checked && !node.props.disabled));
});

test("mock exams keep their declared reshuffle-on-open behavior without resetting quiz identity", () => {
  const f = fixture(); const parent = f.mount(f.page.NcsfContent, { heading: null }); let tree = parent.render();
  button(tree, "Đề thi nhỏ").props.onClick(); tree = parent.render(); const first = quizNode(tree, f.quiz);
  button(tree, "Đề thi thử").props.onClick(); tree = parent.render();
  const mock = nodes(tree, node => node.props.apiRef)[0].node;
  let reshuffles = 0; mock.props.apiRef.current = { reshuffle() { reshuffles++; } };
  button(tree, "Đề thi nhỏ").props.onClick(); tree = parent.render();
  assert.equal(quizNode(tree, f.quiz).node.key, first.node.key);
  button(tree, "Đề thi thử").props.onClick(); tree = parent.render();
  assert.equal(reshuffles, 1);
});

test("failed session checks offer retry before asking for a password", async () => {
  const f = fixture({ sessionResponses: [new Error("offline"), ok({ authed: true })] });
  const page = f.mount(f.page.default); page.render(); await settle(); let tree = page.render();
  const retry = button(tree, "Kiểm tra lại quyền truy cập"); assert.ok(retry);
  retry.props.onClick(); page.render(); await settle(); tree = page.render();
  assert.equal(nodes(tree, node => node.type === f.page.NcsfContent).length, 1);
  assert.equal(f.requests.length, 2);
});

test("failed logout stays truthful and offers another logout attempt", async () => {
  const f = fixture({ sessionResponses: [ok({ authed: true }), { ok: false, status: 503 }, ok({})] });
  const page = f.mount(f.page.default); page.render(); await settle(); let tree = page.render();
  const heading = nodes(tree, node => node.type === f.page.NcsfContent)[0].node.props.heading;
  await button(heading, "Đăng xuất").props.onClick(); tree = page.render();
  const content = nodes(tree, node => node.type === f.page.NcsfContent)[0]; assert.ok(content);
  assert.match(text(content.node.props.heading), /Chưa đăng xuất được/);
  await button(content.node.props.heading, "Đăng xuất").props.onClick(); tree = page.render();
  assert.equal(nodes(tree, node => node.type === f.page.NcsfContent).length, 0);
});
