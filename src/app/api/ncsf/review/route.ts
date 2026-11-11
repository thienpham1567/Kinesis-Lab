import { isNcsfAuthed } from "@/lib/ncsf-auth";
import { NCSF_BUCKET } from "@/lib/ncsf-cpt";
import { serveAnswerReview } from "@/lib/ncsf-answer-review";
import { supabase } from "@/lib/supabase/server";
import { localNcsfDataEnabled, readLocalNcsfReview } from "@/lib/ncsf-local";

// Expanded answer feedback quotes the licensed textbook, so it shares the private bucket.
export async function GET(request: Request) {
  return serveAnswerReview(request, {
    isAuthed: isNcsfAuthed,
    download: async (key) => {
      if (!localNcsfDataEnabled()) return supabase().storage.from(NCSF_BUCKET).download(key);
      try {
        return { data: await readLocalNcsfReview(key), error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
  });
}
