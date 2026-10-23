import {
  generateIllustration,
  imageStatus,
  readImageRequest,
  ImageInputError,
} from "@/lib/illustrations/server";

export const runtime = "nodejs";
export const maxDuration = 150;
export async function GET() {
  return Response.json(await imageStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}
export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin)
    return Response.json(
      { error: "Chỉ nhận yêu cầu từ giao diện Kinesis Lab cùng địa chỉ." },
      { status: 403 },
    );
  try {
    const result = await generateIllustration(await readImageRequest(req));
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof ImageInputError
            ? err.message
            : "Chưa xử lý được yêu cầu tạo hình.",
      },
      { status: err instanceof ImageInputError ? err.status : 500 },
    );
  }
}
