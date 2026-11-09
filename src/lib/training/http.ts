import { ProgramError } from "@/lib/training/program";
export async function trainingResponse(
  action: () => Promise<unknown>,
  status = 200,
) {
  try {
    return Response.json(await action(), {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof ProgramError)
      return Response.json({ error: error.message }, { status: error.status });
    return Response.json(
      {
        error:
          "Chưa xử lý được yêu cầu chương trình; dữ liệu nháp chưa được thay đổi.",
      },
      { status: 503 },
    );
  }
}
export async function trainingBody(req: Request) {
  try {
    const value = await req.json();
    if (JSON.stringify(value).length > 400000) throw new Error();
    return value;
  } catch {
    throw new ProgramError("Nội dung JSON không hợp lệ hoặc quá dài.");
  }
}
