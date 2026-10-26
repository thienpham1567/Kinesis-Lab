import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const { outputText } = ts.transpileModule(
  readFileSync(
    new URL("../src/components/atlas3d/load-deadline.ts", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
);
const { withLoadDeadline } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
let expired = 0;
await assert.rejects(
  withLoadDeadline(new Promise(() => {}), 5, () => expired++),
  /timed out/,
);
assert.equal(expired, 1, "stalled loading offers an error/retry path once");
assert.equal(
  await withLoadDeadline(Promise.resolve("loaded"), 50, () => expired++),
  "loaded",
);
const failure = new Error("Network unavailable");
await assert.rejects(
  withLoadDeadline(Promise.reject(failure), 50, () => expired++),
  (error) => error === failure,
);
await new Promise((resolve) => setTimeout(resolve, 60));
assert.equal(
  expired,
  1,
  "settled loads clear their deadline and never dispose a loaded model",
);
console.log(
  "Anatomy load deadlines: stalled requests fail, successes/errors settle unchanged, timers cleared.",
);
