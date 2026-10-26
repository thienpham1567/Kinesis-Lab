import { chatIllustrationItemGET } from "@/lib/chat/image-api";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return chatIllustrationItemGET(req, id);
}
