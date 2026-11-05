import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
const require = createRequire(import.meta.url);
function component(file, mocks = {}, globals = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  vm.runInNewContext(
    outputText,
    { exports, ...globals, require: (name) => mocks[name] ?? require(name) },
    { filename: file },
  );
  return exports;
}
const shell = (path) =>
  component("src/components/AppShell.tsx", {
    "next/navigation": { usePathname: () => path },
    "next/link": {
      __esModule: true,
      default: ({ children, ...props }) =>
        React.createElement("a", props, children),
    },
    "./StudyChatWidget": { StudyChatWidget: () => null },
    "./ThemePicker": {
      ThemePicker: () => React.createElement("button", null, "Bảng màu"),
    },
    "./WorkspaceUI": {
      Icon: () => React.createElement("svg", { "aria-hidden": true }),
    },
  }).AppShell;

test("study pages expose a labeled toolbar launcher tied to the drawer", () => {
  const html = renderToStaticMarkup(
    React.createElement(shell("/knowledge"), null, "Study page"),
  );
  assert.match(html, /aria-label="Mở trợ lý học tập"/);
  assert.match(html, /aria-controls="study-assistant-drawer"/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /study-chat-launcher/);
});

test("closed drawer uses a native inert dialog and keeps its content mounted", () => {
  const { StudyChatDrawer } = component(
    "src/components/study-chat/StudyChatDrawer.tsx",
  );
  const html = renderToStaticMarkup(
    React.createElement(
      StudyChatDrawer,
      {
        open: false,
        onOpenChange: () => {},
        panelRef: { current: null },
        launcherRef: { current: null },
        composerRef: { current: null },
        titleId: "assistant-title",
        onEscape: () => {},
      },
      React.createElement("textarea", { defaultValue: "Draft stays here" }),
    ),
  );
  assert.match(html, /<dialog/);
  assert.match(html, /id="study-assistant-drawer"/);
  assert.match(html, /aria-labelledby="assistant-title"/);
  assert.match(html, /inert=""/);
  assert.match(html, /Draft stays here/);
});

test("Escape belongs to a visible outside menu before the docked drawer", () => {
  const listeners = new Map();
  let dismissed = 0;
  let prevented = false;
  const menu = { getClientRects: () => [{}] };
  const panel = { open: true, matches: () => false, contains: () => false };
  const doc = {
    activeElement: null,
    querySelector: () => null,
    querySelectorAll: () => [menu],
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener() {},
  };
  const { StudyChatDrawer } = component(
    "src/components/study-chat/StudyChatDrawer.tsx",
    {
      react: { useLayoutEffect: (effect) => effect() },
    },
    {
      document: doc,
      window: {
        matchMedia: () => ({
          matches: true,
          addEventListener() {},
          removeEventListener() {},
        }),
      },
    },
  );
  StudyChatDrawer({
    open: true,
    onOpenChange() {},
    onEscape: () => dismissed++,
    panelRef: { current: panel },
    launcherRef: { current: null },
    composerRef: { current: null },
    titleId: "title",
    children: "content",
  });
  listeners.get("keydown")({
    key: "Escape",
    defaultPrevented: false,
    isComposing: false,
    preventDefault: () => {
      prevented = true;
    },
  });
  assert.equal(
    dismissed,
    0,
    "Escape must close the active menu without closing the drawer",
  );
  assert.equal(prevented, false);
  doc.querySelectorAll = () => [];
  listeners.get("keydown")({
    key: "Escape",
    defaultPrevented: false,
    isComposing: false,
    preventDefault: () => {
      prevented = true;
    },
  });
  assert.equal(dismissed, 1, "without another popup Escape closes the drawer");
});

test("modal Tab and Shift+Tab wrap at the visible control boundaries", () => {
  const doc = { activeElement: null };
  const { StudyChatDrawer } = component(
    "src/components/study-chat/StudyChatDrawer.tsx",
    {
      react: { useLayoutEffect() {} },
    },
    { document: doc },
  );
  const element = StudyChatDrawer({
    open: true,
    onOpenChange() {},
    onEscape() {},
    panelRef: { current: null },
    launcherRef: { current: null },
    composerRef: { current: null },
    titleId: "title",
    children: "content",
  });
  assert.equal(
    typeof element.props.onKeyDown,
    "function",
    "modal keyboard boundaries must not send focus to the document body",
  );
  const control = () => ({
    getClientRects: () => [{}],
    closest: () => null,
    hasAttribute: () => false,
    focus() {
      doc.activeElement = this;
    },
  });
  const first = control(),
    last = control();
  const panel = {
    matches: () => true,
    querySelectorAll: () => [first, last],
    focus() {},
  };
  let prevented = false;
  doc.activeElement = last;
  element.props.onKeyDown({
    key: "Tab",
    shiftKey: false,
    currentTarget: panel,
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(doc.activeElement, first);
  assert.equal(prevented, true);
  element.props.onKeyDown({
    key: "Tab",
    shiftKey: true,
    currentTarget: panel,
    preventDefault() {},
  });
  assert.equal(doc.activeElement, last);
  panel.matches = () => false;
  prevented = false;
  element.props.onKeyDown({
    key: "Tab",
    shiftKey: false,
    currentTarget: panel,
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(
    prevented,
    false,
    "docked mode must permit keyboard navigation into the reader",
  );
});

test("source disclosure summaries keep their natural Shift+Tab order", () => {
  const doc = { activeElement: null };
  const { StudyChatDrawer } = component(
    "src/components/study-chat/StudyChatDrawer.tsx",
    { react: { useLayoutEffect() {} } },
    { document: doc },
  );
  const element = StudyChatDrawer({
    open: true,
    onOpenChange() {},
    onEscape() {},
    panelRef: { current: null },
    launcherRef: { current: null },
    composerRef: { current: null },
    titleId: "title",
    children: "content",
  });
  const control = () => ({
    getClientRects: () => [{}],
    closest: () => null,
    hasAttribute: () => false,
    focus() {
      doc.activeElement = this;
    },
  });
  const first = control(),
    summary = control(),
    last = control();
  const panel = {
    matches: () => true,
    querySelectorAll: (selector) =>
      selector.includes("summary") ? [first, summary, last] : [first, last],
  };
  doc.activeElement = summary;
  let prevented = false;
  element.props.onKeyDown({
    key: "Tab",
    shiftKey: true,
    currentTarget: panel,
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(
    prevented,
    false,
    "a native source summary is not the first control or initial heading",
  );
  assert.equal(
    doc.activeElement,
    summary,
    "let native focus navigation choose the preceding control",
  );
});
