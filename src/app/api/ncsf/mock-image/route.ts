import { isNcsfAuthed } from "@/lib/ncsf-auth";
import { serveNcsfMockAsset } from "@/lib/ncsf-mock-exams";
import { downloadNcsfMock } from "@/lib/ncsf-mock-storage";
export async function GET(request: Request) {
  return serveNcsfMockAsset("image", request, {
    isAuthed: isNcsfAuthed,
    download: downloadNcsfMock,
  });
}
