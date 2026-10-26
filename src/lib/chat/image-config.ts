import type { ImageStatus } from "@/lib/illustrations/catalog";

export const CHAT_IMAGE_MODEL = "google/gemini-nano-banana-2.1";
export const CHAT_IMAGE_PROVIDER = "google-ai-studio";
export const CHAT_IMAGE_RESOLUTION = "1K";
export const CHAT_IMAGE_TARGET = {
  model: CHAT_IMAGE_MODEL,
  provider: CHAT_IMAGE_PROVIDER,
};

// Google standard image-output tokens; excludes prompt and thinking costs.
// https://ai.google.dev/gemini-api/docs/pricing#gemini-nano-banana-2.1
const OUTPUT_TOKENS = { "1K": 1120, "2K": 1680 };
let cached: ImageStatus | null = null;

export async function chatImageStatus(): Promise<ImageStatus> {
  const enabled = Boolean(process.env.OPENROUTER_API_KEY);
  if (cached && Date.now() - Date.parse(cached.priceCheckedAt) < 300_000)
    return { ...cached, enabled };
  const status: ImageStatus = {
    enabled,
    model: CHAT_IMAGE_MODEL,
    prices: { "1K": 0.0336, "2K": 0.0504 },
    priceCheckedAt: "2026-10-26",
    livePrice: false,
  };
  try {
    const res = await fetch(
      `https://openrouter.ai/api/v1/images/models/${CHAT_IMAGE_MODEL}/endpoints`,
      { signal: AbortSignal.timeout(6000), cache: "no-store" },
    );
    if (!res.ok) return status;
    const data = await res.json();
    type Price = { billable: string; unit: string; cost_usd: number; variant?: string };
    const endpoint = data.endpoints?.find(
      (item: { provider_tag?: string }) => item.provider_tag === CHAT_IMAGE_PROVIDER,
    );
    const prices: Price[] = endpoint?.pricing?.filter(
      (price: Price) => price.billable === "output_image",
    ) ?? [];
    const next = { ...status.prices };
    for (const resolution of ["1K", "2K"] as const) {
      const price = prices.find((item) => item.variant === resolution.toLowerCase())
        ?? prices.find((item) => !item.variant);
      if (!price || !Number.isFinite(price.cost_usd) || price.cost_usd < 0)
        throw new Error("Missing image price");
      if (price.unit === "image") next[resolution] = price.cost_usd;
      else if (price.unit === "token") next[resolution] = price.cost_usd * OUTPUT_TOKENS[resolution];
      else throw new Error("Unsupported image price unit");
    }
    status.prices = next;
    status.priceCheckedAt = new Date().toISOString();
    status.livePrice = true;
    cached = status;
  } catch {
    // Retain the dated estimate when the public price catalog is unavailable.
  }
  return status;
}
