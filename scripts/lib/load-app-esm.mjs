import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const cache = new Map();
export function appModuleUrl(file) {
  file = path.resolve(file);
  if (!existsSync(file)) file += existsSync(`${file}.ts`) ? '.ts' : '.tsx';
  if (cache.has(file)) return cache.get(file);
  const js = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText.replace(/import ["'][^"']+\.css["'];?/g, '').replace(
    /from (["'])([^"']+)\1/g,
    (_, q, specifier) => `from ${q}${specifier.startsWith('@/')
      ? appModuleUrl(path.resolve('src', specifier.slice(2)))
      : specifier.startsWith('.') ? appModuleUrl(path.resolve(path.dirname(file), specifier))
      : import.meta.resolve(specifier)}${q}`,
  );
  const url = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
  cache.set(file, url);
  return url;
}
