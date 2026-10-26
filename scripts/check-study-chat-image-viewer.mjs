import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const viewer = readFileSync(new URL("../src/components/chat/StudyChatImageViewer.tsx", import.meta.url), "utf8");
const widget = readFileSync(new URL("../src/components/StudyChatWidget.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

test("native dialog viewer has zoom, pan, fit and download", () => {
  assert.match(viewer, /<dialog/);
  assert.match(viewer, /showModal/);
  assert.match(viewer, /clampZoom/);
  assert.match(viewer, /Vừa màn hình/);
  assert.match(viewer, /Tải ảnh gốc/);
  assert.match(viewer, /onPointerDown/);
  assert.match(css, /study-chat-image-viewer/);
  assert.match(css, /object-fit: contain/);
});

test("zoom is clamped 25–300", () => {
  const load = createAppLoader({ globals: { crypto } });
  const { clampZoom } = load("src/lib/chat/image-client.ts");
  assert.equal(clampZoom(10), 25);
  assert.equal(clampZoom(400), 300);
  assert.equal(clampZoom(100), 100);
});

test("Escape closes viewer before the chat panel", () => {
  assert.match(widget, /if \(images\.viewerId\) return;/);
  assert.match(widget, /StudyChatImageViewer/);
});
