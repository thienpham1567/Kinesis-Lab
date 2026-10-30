import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

function setup() {
  const slots = [], effects = [], requests = [];
  let cursor = 0, tab = null, fail = false;
  const react = {
    Suspense: "Suspense",
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], next => { slots[i] = typeof next === "function" ? next(slots[i]) : next; }]; },
    useEffect(run, deps) { const i = cursor++; const old = slots[i]; if (!old || deps.some((d, j) => d !== old.deps[j])) effects.push(() => { old?.cleanup?.(); slots[i] = { deps, cleanup: run() }; }); },
  };
  const jsx = (type, props) => ({ type, props: props ?? {} });
  const exports = {};
  const source = readFileSync("src/app/atlas/page.tsx", "utf8") + "\nexport { AtlasPageInner };";
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(output, {
    exports, AbortController, URLSearchParams,
    fetch: async (url, options) => { requests.push({ url, signal: options?.signal }); return { ok: !fail, json: async () => ({ clients: [] }) }; },
    require: id => {
      if (id === "react") return react;
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (id === "next/dynamic") return { default: () => "LazyView" };
      if (id === "next/navigation") return { useSearchParams: () => ({ get: () => tab, toString: () => "" }), useRouter: () => ({ replace() {} }) };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  });
  return {
    requests,
    setTab(value) { tab = value; },
    failNext() { fail = true; },
    recover() { fail = false; },
    render() { cursor = 0; const tree = exports.AtlasPageInner(); for (const run of effects.splice(0)) run(); return tree; },
  };
}
function nodes(tree) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
function text(tree) {
  if (tree == null || typeof tree === "boolean") return "";
  if (typeof tree !== "object") return String(tree);
  if (Array.isArray(tree)) return tree.map(text).join(" ");
  return text(tree.props?.children);
}
const tick = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

test("Atlas learning modes do not request client records", async () => {
  const ui = setup();
  for (const mode of [null, "hypertrophy", "trigger_points"]) {
    ui.setTab(mode); ui.render(); await tick();
  }
  assert.equal(ui.requests.length, 0);
});

test("opening client-context mode loads once and aborts when leaving it", async () => {
  const ui = setup(); ui.setTab("clinical_rehab"); ui.render(); await tick(); ui.render();
  assert.equal(ui.requests.length, 1);
  ui.setTab("3d"); ui.render();
  assert.equal(ui.requests[0].signal?.aborted, true);
});

test("client load failure is announced and can retry without leaving Atlas", async () => {
  const ui = setup(); ui.failNext(); ui.setTab("clinical_rehab"); ui.render(); await tick();
  let tree = ui.render();
  assert.ok(nodes(tree).some(n => n.props.role === "alert"));
  const retry = nodes(tree).find(n => n.type === "button" && text(n).includes("Thử tải lại hồ sơ"));
  assert.ok(retry);
  ui.recover(); retry.props.onClick(); ui.render(); await tick(); tree = ui.render();
  assert.equal(ui.requests.length, 2);
  assert.equal(nodes(tree).some(n => n.props.role === "alert"), false);
});
