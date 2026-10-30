import { isNcsfAuthed } from "@/lib/ncsf-auth";
import { serveMockAnswers } from "@/lib/ncsf-mock-answers";
import { downloadNcsfMock } from "@/lib/ncsf-mock-storage";

export async function GET() {
  return serveMockAnswers({
    isAuthed: isNcsfAuthed,
    download: downloadNcsfMock,
  });
}
