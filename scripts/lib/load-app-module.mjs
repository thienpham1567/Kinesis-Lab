import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import path from 'node:path';
const require = createRequire(import.meta.url);
const ts = require('typescript');
export function createAppLoader({ mocks = {}, globals = {} } = {}) {
  const cache = new Map();
  function load(relative) {
    let file = path.resolve(relative);
    if (!existsSync(file) && existsSync(`${file}.ts`)) file += '.ts';
    if (cache.has(file)) return cache.get(file);
    if (file.endsWith('.json')) return JSON.parse(readFileSync(file, 'utf8'));
    const exports = {}; cache.set(file, exports);
    const result = ts.transpileModule(readFileSync(file, 'utf8'), {
      fileName: file, reportDiagnostics: true,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    });
    assert.equal(result.diagnostics?.length ?? 0, 0, `Syntax: ${file}`);
    vm.runInNewContext(result.outputText, { exports, process, fetch, AbortSignal, Response,
      TextEncoder, TextDecoder, ReadableStream, URL, setTimeout, clearTimeout, console,
      ...globals, require: target => {
        if (Object.hasOwn(mocks, target)) return mocks[target];
        if (target.startsWith('@/')) return load(path.resolve('src', target.slice(2)));
        if (target.startsWith('.')) return load(path.resolve(path.dirname(file), target));
        return require(target);
      },
    }, { filename: file });
    return exports;
  }
  return load;
}
