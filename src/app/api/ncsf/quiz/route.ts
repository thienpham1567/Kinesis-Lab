import { isNcsfAuthed } from "@/lib/ncsf-auth";
import { NCSF_BUCKET } from "@/lib/ncsf-cpt";
import { supabase } from "@/lib/supabase/server";
import { localNcsfDataEnabled, readLocalNcsfQuiz } from "@/lib/ncsf-local";
import { parseNcsfQuiz } from "@/lib/ncsf-quiz";

// The quiz quotes the licensed textbook verbatim, so it sits in the same private bucket.
export async function GET() {
  if (!(await isNcsfAuthed())) return new Response("Unauthorized", { status: 401 });
  if (localNcsfDataEnabled()) {
    try {
      const quiz = parseNcsfQuiz(await readLocalNcsfQuiz());
      if (!quiz) return new Response("Invalid local question bank", { status: 503 });
      return Response.json(quiz, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
    } catch {
      return new Response("Local question bank unavailable", { status: 503 });
    }
  }
  const { data, error } = await supabase().storage.from(NCSF_BUCKET).download("quiz.json");
  if (error || !data) return new Response("Not found", { status: 404 });
  return new Response(data, { headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store", Vary: "Cookie" } });
}
