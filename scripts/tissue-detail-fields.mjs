import { TISSUE_DETAIL_MAPS } from "../src/components/atlas3d/tissue-detail-config.mjs";
const tau = Math.PI * 2;
// Periodic deterministic value noise avoids a visible sinusoidal weave at close range.
function periodicNoise(u, v, width, height, seed = 0) {
  const wrap = (n, size) => ((n % size) + size) % size;
  const hash = (x, y) => {
    let h =
      Math.imul(wrap(x, width) + seed, 374761393) ^
      Math.imul(wrap(y, height) + seed, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (((h ^ (h >>> 16)) >>> 0) / 4294967295) * 2 - 1;
  };
  const x = u * width,
    y = v * height,
    ix = Math.floor(x),
    iy = Math.floor(y);
  const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10),
    sx = smooth(x - ix),
    sy = smooth(y - iy);
  const mix = (a, b, t) => a + (b - a) * t;
  return mix(
    mix(hash(ix, iy), hash(ix + 1, iy), sx),
    mix(hash(ix, iy + 1), hash(ix + 1, iy + 1), sx),
    sy,
  );
}
export function heightField(kind, u, v) {
  if (kind === "muscle")
    return (
      0.65 * periodicNoise(u, v, 32, 12, 17) +
      0.25 * periodicNoise(u, v, 64, 32, 29) +
      0.06 * Math.sin(tau * (31 * u + 0.11 * Math.sin(tau * (3 * u + 2 * v))))
    );
  if (kind === "tendon")
    return (
      0.65 * Math.sin(tau * (31 * u + 0.15 * Math.sin(tau * v))) +
      0.14 * Math.sin(tau * (67 * u - 2 * v)) +
      0.07 * Math.sin(tau * (8 * u + 13 * v))
    );
  if (kind === "cartilage")
    return (
      0.65 * Math.sin(tau * (3 * u + 2 * v)) +
      0.2 * Math.cos(tau * (7 * u - 3 * v)) +
      0.1 * Math.sin(tau * (13 * u + 11 * v))
    );
  if (kind === "bone")
    return (
      0.65 * periodicNoise(u, v, 24, 24, 41) +
      0.3 * periodicNoise(u, v, 48, 48, 71)
    );
  throw new Error("Unsupported detail family: " + kind);
}
export function roughnessField(kind, u, v) {
  const p = TISSUE_DETAIL_MAPS[kind];
  if (!p) throw new Error("Unsupported detail family");
  const variation =
    0.7 * periodicNoise(u, v, 7, 7, 23) + 0.3 * periodicNoise(u, v, 17, 17, 43);
  return p.roughness + p.variation * variation;
}
export function detailPixel(kind, u, v) {
  const p = TISSUE_DETAIL_MAPS[kind],
    e = 1 / 8192;
  const dx =
    ((heightField(kind, u + e, v) - heightField(kind, u - e, v)) * p.height) /
    (2 * e * p.scale);
  const dy =
    ((heightField(kind, u, v + e) - heightField(kind, u, v - e)) * p.height) /
    (2 * e * p.scale);
  const len = Math.hypot(dx, dy, 1);
  return [-dx / len, -dy / len, roughnessField(kind, u, v), 1 / len];
}
export function detailImage(kind, size = 512) {
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const n = detailPixel(kind, (x + 0.5) / size, (y + 0.5) / size),
        i = (y * size + x) * 4;
      data[i] = Math.round((n[0] * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round((n[1] * 0.5 + 0.5) * 255);
      data[i + 2] = Math.round(n[2] * 255);
      data[i + 3] = Math.round((n[3] * 0.5 + 0.5) * 255);
    }
  return data;
}
