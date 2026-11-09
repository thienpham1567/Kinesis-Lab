import { identifier, object, ProgramError } from "@/lib/training/program";
import { trainingRepository } from "@/lib/training/repository";
import { trainingBody } from "@/lib/training/http";
import {
  MissingProgramInformation,
  proposeProgram,
  validateProposalIntake,
} from "@/lib/training/proposal";
export const maxDuration = 90;
export async function POST(req: Request) {
  try {
    const body = object(await trainingBody(req));
    const clientId = identifier(body.client_id);
    const draft = validateProposalIntake(body.draft);
    const client = await trainingRepository.getClient(clientId);
    if (!process.env.OPENROUTER_API_KEY)
      throw new ProgramError(
        "Chưa cấu hình AI; bạn vẫn có thể soạn và lưu thủ công.",
        503,
      );
    const history = await trainingRepository.recentHistory(clientId);
    return Response.json(
      await proposeProgram(draft, client, history, req.signal),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof ProgramError
            ? error.message
            : "Chưa tạo được bản nháp. Vui lòng thử lại.",
        retryable: true,
        ...(error instanceof MissingProgramInformation
          ? { questions: error.questions }
          : {}),
      },
      { status: error instanceof ProgramError ? error.status : 502 },
    );
  }
}
