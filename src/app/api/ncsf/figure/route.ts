import { isNcsfAuthed } from "@/lib/ncsf-auth";
import { NCSF_BUCKET } from "@/lib/ncsf-cpt";
import { serveNcsfFigure } from "@/lib/ncsf-quiz";
import { supabase } from "@/lib/supabase/server";
import { localNcsfDataEnabled, readLocalNcsfFigure } from "@/lib/ncsf-local";

export async function GET(request: Request) {
  return serveNcsfFigure(request, {
    isAuthed: isNcsfAuthed,
    download: async (key) => localNcsfDataEnabled()
      ? { data: await readLocalNcsfFigure(key), error: null }
      : supabase().storage.from(NCSF_BUCKET).download(key),
  });
}
