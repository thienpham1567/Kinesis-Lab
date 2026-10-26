import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAppLoader } from './lib/load-app-module.mjs';
const encoder = new TextEncoder();
function stream(text, cuts = []) {
  const bytes = encoder.encode(text);
  return new ReadableStream({ start(controller) {
    let start = 0;
    for (const end of [...cuts, bytes.length]) { controller.enqueue(bytes.slice(start, end)); start = end; }
    controller.close();
  } });
}
test('reads a final NDJSON record without newline and preserves split Vietnamese UTF-8', async () => {
  const load = createAppLoader();
  const { readNdjson } = load('src/lib/ai/stream-events.ts');
  const events = [];
  for await (const event of readNdjson(stream('{"type":"token","text":"Đùi"}\n{"type":"done"}', [25,26,27]))) events.push(event);
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [{ type: 'token', text: 'Đùi' }, { type: 'done' }]);
});
test('parses final SSE data without newline', async () => {
  const { readSseData } = createAppLoader()('src/lib/ai/stream-events.ts');
  const events = [];
  for await (const event of readSseData(stream('data: {"choices":[{"delta":{"content":"A"}}]}\n\ndata: [DONE]', [8,21]))) events.push(event);
  assert.equal(events.length, 2);
  assert.equal(events[1], '[DONE]');
});
