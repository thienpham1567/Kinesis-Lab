import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { createAppLoader } from "./lib/load-app-module.mjs";

const { PARQ_ITEMS } = createAppLoader()("src/lib/clinical/safety.ts");
const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync("src/components/ClientRecordCard.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText, { exports, require: id => id.includes("safety") ? { PARQ_ITEMS } : {} });
const base = { id: "synthetic", name: "Hồ sơ thử", medical_conditions: [], medications: [], orthopedic_issues: [] };
const allNo = Object.fromEntries(PARQ_ITEMS.map(item => [item.id, false]));

test("missing, null and partially answered screening never imply eligibility", () => {
  for (const parq of [undefined, {}, { ...allNo, [PARQ_ITEMS[0].id]: null }, { ...allNo, [PARQ_ITEMS[0].id]: "false" }]) {
    const status = exports.clientStatus({ ...base, red_flags: { parq } });
    assert.equal(status.level, "incomplete");
    assert.equal(status.label, "Chưa hoàn tất sàng lọc");
  }
});
test("fully negative recorded answers describe records without granting clearance", () => {
  const status = exports.clientStatus({ ...base, red_flags: { parq: allNo } });
  assert.equal(status.level, "standard");
  assert.equal(status.label, "Chưa ghi nhận cảnh báo trong hồ sơ");
});
test("existing referral and caution states keep priority over missing answers", () => {
  assert.equal(exports.clientStatus({ ...base, red_flags: { parq: { chest: true } } }).level, "referral");
  assert.equal(exports.clientStatus({ ...base, medications: [{ name: "Fixture" }] }).level, "caution");
});
