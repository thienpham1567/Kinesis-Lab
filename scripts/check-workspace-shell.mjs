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
    "./ThemePicker": {
      ThemePicker: () => React.createElement("button", null, "Bảng màu"),
    },
    "./WorkspaceUI": {
      Icon: () => React.createElement("svg", { "aria-hidden": true }),
    },
  }).AppShell;

test("the app toolbar retains navigation and the theme picker without the study assistant", () => {
  for (const path of ["/knowledge", "/atlas", "/clients", "/movement"]) {
    const html = renderToStaticMarkup(
      React.createElement(shell(path), null, "Workspace content"),
    );
    assert.match(html, /aria-label="Điều hướng chính"/);
    assert.match(html, /Bảng màu/);
    assert.match(html, /Workspace content/);
    assert.doesNotMatch(html, /trợ lý|study-assistant|data-study-open/i);
  }
});
