import { hasSupabase } from "@/lib/supabase/server";

export async function GET() {
  return Response.json({
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    supabase: hasSupabase(),
  });
}
