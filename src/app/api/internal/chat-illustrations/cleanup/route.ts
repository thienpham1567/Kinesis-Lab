import { chatIllustrationCleanup } from "@/lib/chat/image-api";

export const runtime = "nodejs";
export const maxDuration = 60;

export function POST(req: Request) {
  return chatIllustrationCleanup(req);
}

export function GET(req: Request) {
  return chatIllustrationCleanup(req);
}
