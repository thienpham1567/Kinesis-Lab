import type { ChatIllustrationBrief } from "./illustration-types";

export function compileChatIllustrationPrompt(brief: ChatIllustrationBrief) {
  const captions = brief.imageText
    .map((line, index) => `${index + 1}. ${line}`)
    .join("\n");
  const kind =
    brief.subjectKind === "anatomy"
      ? "an original anatomical teaching illustration"
      : brief.subjectKind === "movement"
        ? "an original movement-mechanics teaching infographic"
        : "an original side-by-side comparison teaching infographic";
  return [
    `Create one ${kind} for Kinesis Lab study chat. This is a simulated educational graphic, not a cadaver photograph, patient scan or clinical measurement.`,
    `Visual description: ${brief.visualDescription}`,
    "Paint every requested Vietnamese string directly into the raster, including diacritics. Do not translate, abbreviate, omit tone marks, or replace them with English.",
    `Title to paint exactly: ${brief.title}`,
    `Captions to paint exactly:\n${captions}`,
    "Leave breathing room around lettering. Keep lettering large enough to read when the image is fit on a phone. Place labels next to the structures or panels they describe without crowding.",
    "Do not add extra labels, numbers, arrows, measurements, injury maps, diagnostic claims or captions beyond the title and captions above.",
    "Do not copy a specific published atlas or journal figure.",
  ].join("\n\n");
}
