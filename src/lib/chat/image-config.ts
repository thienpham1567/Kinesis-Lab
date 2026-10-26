export const CHAT_IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";
export const CHAT_IMAGE_PROVIDER = "openai";
export const CHAT_IMAGE_RESOLUTION = "auto";
export const CHAT_IMAGE_ASPECT_RATIO = "auto";
export const CHAT_IMAGE_TARGET = {
  model: CHAT_IMAGE_MODEL,
  provider: CHAT_IMAGE_PROVIDER,
};

type ChatImageStatus = {
  enabled: boolean;
  model: string;
  estimateUsd: null;
  outputTokenPriceUsd: number;
  priceCheckedAt: string;
  livePrice: boolean;
};
let cached: ChatImageStatus | null = null;

export async function chatImageStatus(): Promise<ChatImageStatus> {
  const enabled = Boolean(process.env.OPENROUTER_API_KEY);
  if (cached && Date.now() - Date.parse(cached.priceCheckedAt) < 300_000)
    return { ...cached, enabled };
  const status: ChatImageStatus = {
    enabled,
    model: CHAT_IMAGE_MODEL,
    // Auto dimensions/quality have no fixed per-image estimate.
    estimateUsd: null,
    outputTokenPriceUsd: 0.00003,
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
    const price = prices.find((item) => item.unit === "token" && !item.variant);
    if (!price || !Number.isFinite(price.cost_usd) || price.cost_usd < 0)
      throw new Error("Missing image token price");
    status.outputTokenPriceUsd = price.cost_usd;
    status.priceCheckedAt = new Date().toISOString();
    status.livePrice = true;
    cached = status;
  } catch {
    // Retain the dated token rate when the public price catalog is unavailable.
  }
  return status;
}
