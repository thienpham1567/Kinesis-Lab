import { createHash, randomBytes } from "node:crypto";

export const CHAT_IMAGE_COOKIE = "chat_image_session";

export function newSessionToken() {
  return randomBytes(32).toString("hex");
}

export function sessionOwnerHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24,
  };
}

export function getOrCreateImageSession(
  existing: string | undefined,
  create: boolean,
) {
  if (existing && /^[0-9a-f]{64}$/i.test(existing))
    return {
      token: existing,
      ownerHash: sessionOwnerHash(existing),
      created: false,
    };
  if (!create) return null;
  const token = newSessionToken();
  return { token, ownerHash: sessionOwnerHash(token), created: true };
}
