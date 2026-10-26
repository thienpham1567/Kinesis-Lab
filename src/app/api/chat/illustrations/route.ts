import {
  chatIllustrationGET,
  chatIllustrationPOST,
} from "@/lib/chat/image-api";

export const runtime = "nodejs";
export const maxDuration = 180;

export function GET(req: Request) {
  return chatIllustrationGET(req);
}

export function POST(req: Request) {
  return chatIllustrationPOST(req);
}
