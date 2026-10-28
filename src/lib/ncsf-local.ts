import { readFile } from "node:fs/promises";
import path from "node:path";

// Allows private-content authors to inspect their working JSON without publishing it.
// This flag has no effect on a production server and never bypasses the session gate.
export function localNcsfDataEnabled(env: Record<string, string | undefined> = process.env) {
  return env.NODE_ENV === "development" && env.NCSF_LOCAL_CONTENT === "1";
}

export async function readLocalNcsfQuiz() {
  const chapters = await Promise.all(Array.from({ length: 8 }, async (_, i) => ({
    ch: i + 1,
    questions: JSON.parse(await readFile(path.join(process.cwd(), ".data/ncsf/quiz", `ch${i + 1}.json`), "utf8")),
  })));
  return { chapters };
}

export async function readLocalNcsfFigure(key: string) {
  if (!/^figures\/ch[1-8]-p[1-9]\d{0,2}\.png$/.test(key)) throw new Error("Invalid figure key");
  const bytes = await readFile(path.join(process.cwd(), ".data/ncsf", key));
  return new Blob([new Uint8Array(bytes)], { type: "image/png" });
}
