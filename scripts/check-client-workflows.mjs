import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

// Exercise the real component handlers with isolated React hooks and synthetic
// responses. No browser, hosted service, private fixture or local store is used.
const detailFile = "src/app/clients/[id]/page.tsx";
const listFile = "src/app/clients/page.tsx";
const client = { id: "fixture-client", name: "Học viên thử", updated_at: "fixture", medical_conditions: [], medications: [], orthopedic_issues: [], red_flags: {} };
const marker = { id: "fixture-marker", kind: "lab", recorded_at: "2026-10-30", metrics: {} };
const response = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
const tick = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

function mount(file, name, props, fetcher) {
  const slots = [], effects = [];
  let cursor = 0;
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
      return [slots[i], next => { slots[i] = typeof next === "function" ? next(slots[i]) : next; }];
    },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useCallback(fn, deps) { const i = cursor++; const old = slots[i]; if (!old || deps.some((v, j) => v !== old.deps[j])) slots[i] = { fn, deps }; return slots[i].fn; },
    useEffect(fn, deps) { const i = cursor++; const old = slots[i]; if (!old || deps.some((v, j) => v !== old.deps[j])) { effects.push(() => { old?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; }); } },
    Suspense: "Suspense",
  };
  const jsx = (type, props) => ({ type, props: props ?? {} });
  const exports = {};
  const source = readFileSync(file, "utf8") + (name === "default" ? "" : `\nexport { ${name} };`);
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(output, {
    exports, fetch: (...args) => fetcher(...args), AbortController, URLSearchParams, FormData, console,
    window: { setTimeout: fn => fn() },
    require(id) {
      if (id === "react") return react;
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (id === "next/link") return { default: "a" };
      if (id === "next/navigation") return { useParams: () => ({ id: client.id }), useSearchParams: () => new URLSearchParams(), useRouter: () => ({ push() {} }) };
      if (id.includes("image-compress")) return { compressImageForUpload: async f => f, MAX_UPLOAD_BYTES: 4_000_000 };
      if (id.includes("safety")) return { safetyNotes: () => "Fixture limit", PARQ_ITEMS: [] };
      if (id.includes("anatomy-atlas")) return { matchClientIssuesToRegions: () => ({}) };
      if (id.includes("ClientRecordCard")) return { ClientRecordCard: "ClientRecordCard", clientStatus: () => ({ level: "none" }) };
      if (id.includes("WorkspaceUI")) return { Icon: "Icon", PageHeading: "PageHeading", SectionHeading: "SectionHeading", EmptyState: "EmptyState" };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  }, { filename: file });
  return {
    render() { cursor = 0; const tree = exports[name](name === "ClientDetailPageInner" ? { id: client.id, ...props } : props); for (const run of effects.splice(0)) run(); return tree; },
    unmount() { for (const slot of slots) slot?.cleanup?.(); },
  };
}
function nodes(tree, match) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(x => nodes(x, match));
  return [...(match(tree) ? [tree] : []), ...nodes(tree.props?.children, match)];
}
function text(tree) {
  if (tree == null || typeof tree === "boolean") return "";
  if (typeof tree !== "object") return String(tree);
  if (Array.isArray(tree)) return tree.map(text).join(" ");
  return text(tree.props?.children);
}
function button(tree, label) { return nodes(tree, n => n.type === "button" && text(n).includes(label))[0]; }

test("profile network failure can retry in place and clear the old error", async () => {
  let calls = 0;
  const ui = mount(detailFile, "ClientDetailPageInner", {}, async () => { if (++calls === 1) throw new TypeError("offline"); return response({ client, biomarkers: [] }); });
  ui.render(); await tick();
  const retry = button(ui.render(), "Thử tải lại");
  assert.ok(retry, "Network failure must offer an in-place retry");
  await retry.props.onClick(); await tick();
  const tree = ui.render();
  assert.ok(text(tree).includes(client.name));
  assert.equal(nodes(tree, n => n.props.role === "alert").length, 0);
  assert.equal(calls, 2);
});

test("missing profile is distinct from a recoverable connection failure", async () => {
  const ui = mount(detailFile, "ClientDetailPageInner", {}, async () => response({ error: "Không tìm thấy học viên" }, 404));
  ui.render(); await tick(); const tree = ui.render();
  assert.ok(text(tree).includes("Không tìm thấy học viên"));
  assert.ok(nodes(tree, n => n.props.href === "/clients").length);
  assert.equal(button(tree, "Thử tải lại"), undefined);
});

test("unmounted profile ignores a response that arrives after cancellation", async () => {
  const pending = deferred();
  let signal;
  const ui = mount(detailFile, "ClientDetailPageInner", {}, async (_, options) => { signal = options?.signal; return pending.promise; });
  ui.render(); ui.unmount();
  assert.equal(signal?.aborted, true, "Profile loading must be cancelled on unmount");
  pending.resolve(response({ client, biomarkers: [] })); await tick();
  assert.equal(text(ui.render()).includes(client.name), false);
});

test("upload has a button action and clears the selected file for same-file retries", async () => {
  let requests = 0;
  const ui = mount(detailFile, "Labs", { clientId: client.id, records: [], onChange: async () => true }, async (_, options) => {
    requests++;
    assert.equal(options.body.get("file").name, "synthetic-retry.pdf");
    return response({ error: "Không đọc được phiếu thử" }, 500);
  });
  let tree = ui.render();
  const action = button(tree, "Tải ảnh / PDF");
  assert.ok(action, "The upload action must be a keyboard-operable button");
  const input = nodes(tree, n => n.type === "input" && n.props.type === "file")[0];
  let clicked = 0;
  input.props.ref.current = { click() { clicked++; } };
  action.props.onClick();
  assert.equal(clicked, 1);
  const file = new File(["synthetic fixture only"], "synthetic-retry.pdf", { type: "application/pdf" });
  for (let attempt = 1; attempt <= 2; attempt++) {
    const element = { files: [file], value: "synthetic-retry.pdf" };
    input.props.onChange({ currentTarget: element });
    assert.equal(element.value, "", "Every selection must reset so the same file can trigger a later change");
    await tick();
    tree = ui.render();
    assert.equal(requests, attempt);
    assert.ok(nodes(tree, n => n.props.role === "alert" && text(n).includes("Không đọc được")).length);
  }
  assert.ok(button(tree, "Tải ảnh / PDF"));
});

test("profile HTTP and malformed-response errors remain recoverable", async () => {
  for (const failedResponse of [response({ error: "fixture failure" }, 500), { ok: true, status: 200, json: async () => { throw new SyntaxError("fixture invalid JSON"); } }]) {
    let first = true;
    const ui = mount(detailFile, "ClientDetailPageInner", {}, async () => {
      if (first) { first = false; return failedResponse; }
      return response({ client, biomarkers: [] });
    });
    ui.render(); await tick();
    await button(ui.render(), "Thử tải lại").props.onClick(); await tick();
    assert.ok(text(ui.render()).includes(client.name));
  }
});

test("failed lab deletion preserves the record, announces failure and permits retry", async () => {
  let refreshes = 0;
  const ui = mount(detailFile, "Labs", { clientId: client.id, records: [marker], onChange: async () => { refreshes++; return true; } }, async () => response({ error: "Không xóa được bản ghi" }, 500));
  const remove = button(ui.render(), "Xóa bản ghi");
  await remove.props.onClick(); await tick(); const tree = ui.render();
  assert.equal(refreshes, 0, "A rejected deletion must not be treated as successful");
  assert.ok(nodes(tree, n => n.props.role === "alert" && text(n).includes("Không xóa được")).length);
  assert.equal(button(tree, "Xóa bản ghi").props.disabled, false);
});

test("lab deletion blocks duplicate requests and refreshes only after success", async () => {
  const pending = deferred(); let calls = 0, refreshes = 0;
  const ui = mount(detailFile, "Labs", { clientId: client.id, records: [marker], onChange: async () => { refreshes++; return true; } }, () => { calls++; return pending.promise; });
  const remove = button(ui.render(), "Xóa bản ghi");
  const first = remove.props.onClick(); const second = remove.props.onClick();
  assert.equal(calls, 1, "Repeated activation during deletion must be ignored");
  assert.equal(button(ui.render(), "Đang xóa").props.disabled, true);
  assert.equal(refreshes, 0);
  pending.resolve(response({ ok: true })); await Promise.all([first, second]); await tick();
  assert.equal(refreshes, 1);
  assert.ok(nodes(ui.render(), n => n.props.role === "status" && text(n).includes("Đã xóa")).length);
});

test("successful deletion with failed refresh reports the completed deletion truthfully", async () => {
  for (const refresh of [async () => false, async () => { throw new TypeError("fixture offline refresh"); }]) {
    const ui = mount(detailFile, "Labs", { clientId: client.id, records: [marker], onChange: refresh }, async () => response({ ok: true }));
    await button(ui.render(), "Xóa bản ghi").props.onClick(); await tick();
    const tree = ui.render();
    assert.ok(nodes(tree, n => n.props.role === "status" && text(n).includes("Đã xóa bản ghi; chưa tải lại")).length);
    assert.equal(nodes(tree, n => n.props.role === "alert").length, 0);
  }
});

test("newly created profile has a direct link even when list refresh fails", async () => {
  let gets = 0;
  const ui = mount(listFile, "default", {}, async (_, options) => {
    if (options?.method === "POST") return response({ client });
    if (++gets === 1) return response({ clients: [] });
    throw new TypeError("offline");
  });
  ui.render(); await tick();
  nodes(ui.render(), n => n.type === "input" && n.props["aria-label"] === "Tìm theo tên, bệnh lý hoặc mục tiêu")[0].props.onChange({ target: { value: "Tên học viên khác" } });
  const heading = nodes(ui.render(), n => n.type === "PageHeading")[0];
  button(heading, "Thêm học viên").props.onClick();
  let tree = ui.render();
  nodes(tree, n => n.type === "input" && n.props.autoComplete === "name")[0].props.onChange({ target: { value: client.name } });
  tree = ui.render();
  await nodes(tree, n => n.type === "form")[0].props.onSubmit({ preventDefault() {} }); await tick();
  const links = nodes(ui.render(), n => n.props.href === `/clients/${client.id}`);
  assert.equal(links.length, 1, "Creation must expose the returned profile independently of refresh/filter results");
  assert.ok(text(links[0]).includes(client.name));
  assert.equal(nodes(ui.render(), n => n.type === "input" && n.props["aria-label"] === "Tìm theo tên, bệnh lý hoặc mục tiêu")[0].props.value, "Tên học viên khác", "Creating a profile preserves the user's active search");
});

test("closing a client form returns focus to its trigger and retains the draft", async () => {
  const ui = mount(listFile, "default", {}, async () => response({ clients: [] }));
  ui.render(); await tick();
  let tree = ui.render();
  const heading = nodes(tree, n => n.type === "PageHeading")[0];
  const trigger = button(heading, "Thêm học viên");
  assert.ok(trigger.props["aria-controls"], "Trigger identifies the inline form");
  let focused = false;
  trigger.props.ref.current = { focus() { focused = true; } };
  trigger.props.onClick(); tree = ui.render();
  nodes(tree, n => n.type === "input" && n.props.autoComplete === "name")[0].props.onChange({ target: { value: "Bản nháp thử" } });
  tree = ui.render();
  const close = button(tree, "Đóng biểu mẫu");
  assert.ok(close, "The autofocus destination needs a nearby exit");
  close.props.onClick(); tree = ui.render();
  assert.equal(nodes(tree, n => n.type === "form").length, 0);
  assert.equal(focused, true);
  button(nodes(tree, n => n.type === "PageHeading")[0], "Thêm học viên").props.onClick();
  assert.equal(nodes(ui.render(), n => n.type === "input" && n.props.autoComplete === "name")[0].props.value, "Bản nháp thử");
});
