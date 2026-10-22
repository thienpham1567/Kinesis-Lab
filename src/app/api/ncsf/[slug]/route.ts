import { isNcsfAuthed } from "@/lib/ncsf-auth";
import { NCSF_BUCKET, NCSF_CPT } from "@/lib/ncsf-cpt";
import { supabase } from "@/lib/supabase/server";

// Licensed course PDFs live in a private bucket; logged-in users get a short-lived signed URL.
// Redirecting (instead of proxying) keeps 8 MB PDFs off the serverless response limit.
export async function GET(_req: Request, ctx: RouteContext<"/api/ncsf/[slug]">) {
  if (!(await isNcsfAuthed())) return new Response("Unauthorized", { status: 401 });
  const { slug } = await ctx.params;
  if (!NCSF_CPT.some((c) => c.slug === slug)) return new Response("Not found", { status: 404 });
  const { data, error } = await supabase().storage.from(NCSF_BUCKET).createSignedUrl(`${slug}.pdf`, 600);
  if (error || !data) return new Response("Not found", { status: 404 });
  return Response.redirect(data.signedUrl, 307);
}
