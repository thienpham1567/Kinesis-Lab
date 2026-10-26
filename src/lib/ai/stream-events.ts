async function* readLines(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  let finished = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) { finished = true; break; }
      pending += decoder.decode(value, { stream: true });
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      for (const line of lines) yield line.replace(/\r$/, "");
    }
    pending += decoder.decode();
    if (pending.trim()) yield pending.replace(/\r$/, "");
  } finally {
    if (!finished) await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function* readNdjson<T = Record<string, unknown>>(body: ReadableStream<Uint8Array>): AsyncGenerator<T> {
  for await (const line of readLines(body)) {
    if (line.trim()) yield JSON.parse(line) as T;
  }
}

export async function* readSseData(body: ReadableStream<Uint8Array>) {
  for await (const line of readLines(body)) {
    if (line.startsWith("data:")) {
      const value = line.slice(5).trim();
      if (value) yield value;
    }
  }
}
