import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

function position(input) {
  const file = "src/lib/ui/reading-position.ts";
  assert.ok(existsSync(file), "Reading position needs a testable nested-viewport calculation");
  return createAppLoader()(file).readingPosition(input);
}
const article = { articleTop: 64, articleBottom: 2064, viewportTop: 64, viewportBottom: 784, navHeight: 96, sectionTops: [300, 900, 1400, 1800] };

test("reading position measures the nested viewport with bottom navigation excluded", () => {
  assert.deepEqual({ ...position(article) }, { percent: 0, activeIndex: 0 });
  assert.deepEqual({ ...position({ ...article, articleTop: -576, articleBottom: 1424, sectionTops: [-340, 260, 760, 1160] }) }, { percent: 50, activeIndex: 0 });
});
test("current section follows the heading under the sticky contents", () => {
  assert.equal(position({ ...article, articleTop: -900, articleBottom: 1100, sectionTops: [-664, -64, 436, 836] }).activeIndex, 1);
});
test("desktop anchor navigation honors the target's CSS scroll margin", () => {
  assert.equal(position({ ...article, articleTop: -900, articleBottom: 1100, navHeight: 76, sectionScrollMargin: 144, sectionTops: [-664, 208, 436, 836] }).activeIndex, 1);
});
test("the bottom of the article selects sources and clamps percentage", () => {
  assert.deepEqual({ ...position({ ...article, articleTop: -1216, articleBottom: 784, sectionTops: [-980, -380, 120, 520] }) }, { percent: 100, activeIndex: 3 });
  assert.equal(position({ ...article, articleTop: -2000, articleBottom: 0 }).percent, 100);
  assert.equal(position({ ...article, articleTop: 200, articleBottom: 2200 }).percent, 0);
});
test("a short article and a missing section list have defined positions", () => {
  assert.deepEqual({ ...position({ ...article, articleBottom: 400, sectionTops: [] }) }, { percent: 100, activeIndex: 0 });
});
