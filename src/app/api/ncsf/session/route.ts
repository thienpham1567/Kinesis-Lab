import { cookies } from "next/headers";
import { NCSF_COOKIE, isNcsfAuthed, passwordMatches, sessionCookie } from "@/lib/ncsf-auth";

export async function GET() {
  return Response.json({ authed: await isNcsfAuthed() });
}

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !passwordMatches(password))
    return Response.json({ error: "Sai mật khẩu." }, { status: 401 });
  (await cookies()).set(sessionCookie());
  return Response.json({ authed: true });
}

export async function DELETE() {
  (await cookies()).delete(NCSF_COOKIE);
  return Response.json({ authed: false });
}
