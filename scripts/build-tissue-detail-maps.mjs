import sharp from "sharp";
import { writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { TISSUE_DETAIL_MAPS } from "../src/components/atlas3d/tissue-detail-config.mjs";
import { detailImage } from "./tissue-detail-fields.mjs";
const size = 256,
  maps = [];
for (const [kind, parameters] of Object.entries(TISSUE_DETAIL_MAPS)) {
  const image = await sharp(detailImage(kind, size), {
    raw: { width: size, height: size, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const path = new URL("../public" + parameters.url, import.meta.url);
  await writeFile(path, image);
  maps.push({
    kind,
    file: path.pathname.split("/").at(-1),
    width: size,
    height: size,
    bytes: image.length,
    sha256: createHash("sha256").update(image).digest("hex"),
    ...parameters,
  });
}
const generator = await readFile(
  new URL("./tissue-detail-fields.mjs", import.meta.url),
);
await writeFile(
  new URL("../public/anatomy/3d/textures/DETAIL-MAPS.json", import.meta.url),
  JSON.stringify(
    {
      version: 1,
      origin: "Deterministic authored periodic surface fields",
      channels: {
        R: "normal X * .5 + .5",
        G: "normal Y * .5 + .5",
        B: "roughness",
        A: "normal Z * .5 + .5",
      },
      colorSpace: "linear data / NoColorSpace",
      units:
        "Nominal height/scale in metres are artistic parameters, not measurements",
      anatomicalFiberMap: false,
      photographic: false,
      generator: "scripts/tissue-detail-fields.mjs",
      generatorSha256: createHash("sha256").update(generator).digest("hex"),
      distribution: "Kinesis Lab illustrative assets, CC BY-SA 4.0",
      maps,
    },
    null,
    2,
  ) + "\n",
);
console.log(maps.map((m) => `${m.kind}: ${m.bytes} bytes`).join("\n"));
console.log(
  "Total detail maps:",
  maps.reduce((n, m) => n + m.bytes, 0),
  "bytes",
);
