import * as THREE from "three";
import { atlasDisplayNames, atlasSourceName } from "@/lib/clinical/atlas-names";
import type { AtlasStructure } from "@/lib/clinical/atlas-3d";
import type { AtlasCamera } from "./atlas-camera";
import { surfaceLabelPoint } from "./surface-label-layout.mjs";

type LabelBounds = { x: number; y: number; width: number; height: number };
const LABEL_STYLE =
  "max-width:min(240px,65%);white-space:normal;overflow-wrap:anywhere;line-height:1.35;text-align:left;";
const overlaps = (a: LabelBounds, b: LabelBounds) =>
  a.x < b.x + b.width + 8 &&
  a.x + a.width + 8 > b.x &&
  a.y < b.y + b.height + 8 &&
  a.y + a.height + 8 > b.y;

/** Concise bilingual labels; mesh hits are display anchors, never landmarks. */
export class StructureCallouts {
  private root = document.createElement("div");
  private items: {
    button: HTMLButtonElement;
    line: HTMLDivElement;
    primary: HTMLSpanElement;
    english: HTMLSpanElement;
    id: string;
    click: () => void;
  }[];

  constructor(host: HTMLElement, select: (id: string) => void) {
    this.root.className =
      "absolute inset-0 pointer-events-none overflow-hidden";
    this.root.setAttribute("role", "group");
    this.root.setAttribute("aria-label", "Tên cấu trúc trong mô hình nguồn");
    host.appendChild(this.root);
    this.items = Array.from({ length: 3 }, () => {
      const button = document.createElement("button");
      const line = document.createElement("div");
      const primary = document.createElement("span");
      const english = document.createElement("span");
      primary.className = "block";
      english.className = "mt-0.5 block text-xs font-normal text-slate";
      english.lang = "en";
      button.append(primary, english);
      const item = {
        button,
        line,
        primary,
        english,
        id: "",
        click: () => select(item.id),
      };
      button.type = "button";
      button.hidden = line.hidden = true;
      button.className =
        "absolute pointer-events-auto rounded-xl border border-rule bg-sheet/95 px-2.5 py-2 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-cobalt";
      button.style.cssText = LABEL_STYLE;
      button.title =
        "Tên cấu trúc từ danh mục mô hình nguồn. Điểm nối chỉ dùng đặt nhãn; không phải mốc bám giải phẫu đã đo.";
      line.style.cssText =
        "position:absolute;height:2px;background:var(--cobalt);transform-origin:0 50%;pointer-events:none;";
      line.setAttribute("aria-hidden", "true");
      const dot = document.createElement("span");
      dot.style.cssText = "position:absolute;width:7px;height:7px;left:-3px;top:-2.5px;border-radius:50%;background:var(--cobalt);box-shadow:0 0 0 1.5px var(--sheet);";
      line.appendChild(dot);
      button.addEventListener("click", item.click);
      this.root.append(line, button);
      return item;
    });
  }

  update(
    enabled: boolean,
    selectedId: string | null,
    structures: AtlasStructure[],
    meshes: Map<string, THREE.Mesh[]>,
    camera: AtlasCamera,
    width: number,
    height: number,
    occupied: LabelBounds[],
    targetIds?: ReadonlySet<string>,
  ) {
    for (const item of this.items) item.button.hidden = item.line.hidden = true;
    if (!enabled || width < 240 || height < 200) return;
    // Match the deep-tissue colour overlay: covering body surfaces do not hide its labels.
    const visible = [...meshes.values()].flat().filter((mesh) => mesh.visible && (!targetIds?.size || targetIds.has(mesh.userData.structureId)));
    // Bound raycasting and DOM work independently of the full catalog size.
    const candidates = structures.flatMap((structure) => {
      if (targetIds?.size && !targetIds.has(structure.id)) return [];
      const own =
        meshes.get(structure.id)?.filter((mesh) => mesh.visible) ?? [];
      if (!own.length) return [];
      const box = new THREE.Box3();
      for (const mesh of own) box.expandByObject(mesh);
      const center = box.getCenter(new THREE.Vector3()).project(camera);
      if (
        structure.id !== selectedId && (
          center.z < -1 || center.z > 1 ||
          Math.abs(center.x) > 1.2 || Math.abs(center.y) > 1.2
        )
      )
        return [];
      const size = box.getSize(new THREE.Vector3());
      const view = camera.matrixWorldInverse.elements;
      const horizontal =
        Math.abs(view[0]) * size.x +
        Math.abs(view[4]) * size.y +
        Math.abs(view[8]) * size.z;
      const vertical =
        Math.abs(view[1]) * size.x +
        Math.abs(view[5]) * size.y +
        Math.abs(view[9]) * size.z;
      return [
        { structure, depth: center.z, prominence: horizontal * vertical },
      ];
    });
    // Prefer muscle names when present; tiny hand bones otherwise consume the
    // full-body label budget. All anchors still require an unobscured mesh hit.
    candidates.sort(
      (a, b) =>
        Number(b.structure.id === selectedId) -
          Number(a.structure.id === selectedId) ||
        Number(b.structure.layer === "muscle") -
          Number(a.structure.layer === "muscle") ||
        b.prominence - a.prominence ||
        a.depth - b.depth,
    );
    const bounds = [...occupied];
    let count = 0;
    for (const { structure } of candidates.slice(0, 18)) {
      if (count === this.items.length) break;
      const point = surfaceLabelPoint(
        meshes.get(structure.id) ?? [],
        visible,
        camera,
        width,
        height,
        { sampleSurface: structure.id === selectedId },
      );
      if (!point) continue;
      const item = this.items[count];
      item.id = structure.id;
      const side =
        structure.side === "left"
          ? " · Trái"
          : structure.side === "right"
            ? " · Phải"
            : "";
      const names = atlasDisplayNames(structure);
      const primary = names.vietnamese ?? names.english;
      if (item.primary.textContent !== primary)
        item.primary.textContent = primary;
      item.primary.lang = names.vietnamese ? "vi" : "en";
      if (item.english.textContent !== names.english)
        item.english.textContent = names.english;
      item.english.hidden = !names.vietnamese;
      item.button.title = `${atlasSourceName(structure)}${side} — tên cấu trúc từ danh mục mô hình nguồn. Điểm nối chỉ dùng đặt nhãn; không phải mốc bám giải phẫu đã đo.`;
      item.button.setAttribute(
        "aria-label",
        `${primary}${names.vietnamese ? ` · ${names.english}` : ""}`,
      );
      item.button.setAttribute(
        "aria-pressed",
        String(structure.id === selectedId),
      );
      item.button.dataset.selected = String(structure.id === selectedId);
      item.button.dataset.structureId = structure.id;
      // A reused absolute slot must measure at a stable origin. Otherwise its
      // previous left position changes shrink-to-fit width before placement.
      item.button.style.cssText = `${LABEL_STYLE}left:0;top:0;`;
      item.button.hidden = false;
      const w = item.button.offsetWidth;
      // Lock rounded pixel width before reading height: a fractional natural
      // width can gain a wrapped line when offsetWidth is rounded down.
      item.button.style.width = `${w}px`;
      const h = item.button.offsetHeight;
      if (w > width - 24 || h > height - 24) {
        item.button.hidden = true;
        continue;
      }
      const labelSide = targetIds?.size
        ? point.x < width / 2 ? -1 : 1
        : point.x < width / 2 ? 1 : -1;
      // Clamping a wide label to a narrow viewport can put it over its own
      // anchor. Try both sides, then above/below, and keep the pointer exposed.
      const placements = [
        { x: point.x + labelSide * 30 - (labelSide < 0 ? w : 0), y: point.y - h / 2 },
        { x: point.x - labelSide * 30 - (labelSide > 0 ? w : 0), y: point.y - h / 2 },
        { x: point.x - w / 2, y: point.y - h - 30 },
        { x: point.x - w / 2, y: point.y + 30 },
      ].map(({ x, y }) => ({
        x: THREE.MathUtils.clamp(x, 12, width - w - 12),
        y: THREE.MathUtils.clamp(y, 12, height - h - 12),
        width: w,
        height: h,
      }));
      const rect = placements.find((candidate) =>
        !bounds.some((other) => overlaps(candidate, other)) &&
        !overlaps(candidate, { x: point.x - 4, y: point.y - 4, width: 8, height: 8 }),
      );
      if (!rect) {
        item.button.hidden = true;
        continue;
      }
      const { x, y } = rect;
      bounds.push(rect);
      item.button.style.cssText = `${LABEL_STYLE}width:${w}px;left:${x}px;top:${y}px;border-color:${structure.id === selectedId ? "var(--cobalt)" : "var(--rule)"};`;
      const endX = THREE.MathUtils.clamp(point.x, x, x + w);
      const endY = THREE.MathUtils.clamp(point.y, y, y + h);
      item.line.hidden = false;
      item.line.style.cssText = `position:absolute;height:2px;background:var(--cobalt);transform-origin:0 50%;pointer-events:none;left:${point.x}px;top:${point.y}px;width:${Math.hypot(endX - point.x, endY - point.y)}px;transform:rotate(${Math.atan2(endY - point.y, endX - point.x)}rad);`;
      count++;
    }
  }

  dispose() {
    for (const item of this.items)
      item.button.removeEventListener("click", item.click);
    this.root.remove();
  }
}
