import { trainingRepository } from "@/lib/training/repository";
import { object, identifier } from "@/lib/training/program";
import { trainingBody, trainingResponse } from "@/lib/training/http";
export async function GET(req: Request) {
  return trainingResponse(async () => ({
    plans: await trainingRepository.listPlans(
      identifier(new URL(req.url).searchParams.get("client_id")),
    ),
  }));
}
export async function POST(req: Request) {
  return trainingResponse(
    async () => ({
      plan: await trainingRepository.savePlan(await trainingBody(req)),
    }),
    201,
  );
}
export async function PATCH(req: Request) {
  return trainingResponse(async () => {
    const body = object(await trainingBody(req));
    return {
      plan: await trainingRepository.setPlanStatus(
        identifier(body.client_id),
        identifier(body.plan_id),
        body.status,
      ),
    };
  });
}
