import { readFile } from "node:fs/promises";
import path from "node:path";
import { localNcsfDataEnabled } from "./ncsf-local";
import { NCSF_BUCKET } from "./ncsf-cpt";
import { supabase } from "./supabase/server";

export async function downloadNcsfMock(key: string) {
  if (
    key !== "mock-exams.json" &&
    !/^mock-exams\/e[12]-q(?:[1-9]|[1-9]\d|1[0-4]\d|150)-i[1-4]\.png$/.test(key)
  )
    throw new Error("Invalid object key");
  if (localNcsfDataEnabled()) {
    const bytes = await readFile(path.join(process.cwd(), ".data/ncsf", key));
    return { data: new Blob([new Uint8Array(bytes)]), error: null };
  }
  return supabase().storage.from(NCSF_BUCKET).download(key);
}
