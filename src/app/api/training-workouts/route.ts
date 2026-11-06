import { trainingRepository } from "@/lib/training/repository";
import { identifier } from "@/lib/training/program";
import { trainingBody, trainingResponse } from "@/lib/training/http";
export async function GET(req: Request) {
  return trainingResponse(async () => ({
    workouts: await trainingRepository.listWorkouts(
      identifier(new URL(req.url).searchParams.get("client_id")),
    ),
  }));
}
export async function PUT(req: Request) {
  return trainingResponse(async () => ({
    workout: await trainingRepository.saveWorkout(await trainingBody(req)),
  }));
}
