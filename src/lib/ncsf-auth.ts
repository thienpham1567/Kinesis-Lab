import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Single-user password gate for the licensed NCSF materials. Cookie = "<expiry>.<hmac>",
// keyed by NCSF_ACCESS_PASSWORD, so changing the password signs everyone out.
// ponytail: one shared password, no per-user accounts or rate limiting; use a long password.
export const NCSF_COOKIE = "ncsf_session";
const MAX_AGE = 30 * 24 * 60 * 60;

const secret = () => process.env.NCSF_ACCESS_PASSWORD ?? "";
const sign = (exp: string) => createHmac("sha256", secret()).update(exp).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const passwordMatches = (input: string) => secret().length > 0 && safeEqual(input, secret());

export function sessionCookie() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return {
    name: NCSF_COOKIE,
    value: `${exp}.${sign(exp)}`,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}

export async function isNcsfAuthed() {
  if (!secret()) return false;
  const [exp, mac] = ((await cookies()).get(NCSF_COOKIE)?.value ?? "").split(".");
  return Boolean(exp && mac && Number(exp) > Date.now() && safeEqual(mac, sign(exp)));
}
