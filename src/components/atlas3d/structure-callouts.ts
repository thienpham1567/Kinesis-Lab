import * as THREE from "three";
import { atlasStructureName } from "@/lib/clinical/atlas-names";
import type { AtlasStructure } from "@/lib/clinical/atlas-3d";
import type { AtlasCamera } from "./atlas-camera";
import { surfaceLabelPoint } from "./surface-label-layout.mjs";

type LabelBounds = { x: number; y: number; width: number; height: number };
const overlaps = (a: LabelBounds, b: LabelBounds) =>
  a.x < b.x + b.width + 8 &&
  a.x + a.width + 8 > b.x &&
  a.y < b.y + b.height + 8 &&
  a.y + a.height + 8 > b.y;

/** Whole source-structure names; mesh hits are display anchors, never landmarks. */
export class StructureCallouts {
  private root = document.createElement("div");
  private items: {
    button: HTMLButtonElement;
    line: HTMLDivElement;
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
      const item = { button, line, id: "", click: () => select(item.id) };
      button.type = "button";
      button.hidden = line.hidden = true;
      button.className =
        "absolute pointer-events-auto rounded-lg border border-rule bg-sheet px-3 py-2 text-xs font-semibold text-ink shadow-sm focus-visible:outline-2 focus-visible:outline-cobalt";
      button.style.cssText =
        "max-width:min(220px,60%);overflow-wrap:anywhere;line-height:1.35;text-align:left;";
      button.title =
        "Tên cấu trúc từ danh mục mô hình nguồn. Điểm nối chỉ dùng đặt nhãn; không phải mốc bám giải phẫu đã đo.";
      line.style.cssText =
        "position:absolute;height:1px;background:var(--slate);transform-origin:0 50%;pointer-events:none;";
      line.setAttribute("aria-hidden", "true");
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
  ) {
    for (const item of this.items) item.button.hidden = item.line.hidden = true;
    if (!enabled || width < 240 || height < 200) return;
    const visible = [...meshes.values()].flat().filter((mesh) => mesh.visible);
    // Bound raycasting and DOM work independently of the full catalog size.
    const candidates = structures.flatMap((structure) => {
      const own =
        meshes.get(structure.id)?.filter((mesh) => mesh.visible) ?? [];
      if (!own.length) return [];
      const box = new THREE.Box3();
      for (const mesh of own) box.expandByObject(mesh);
      const center = box.getCenter(new THREE.Vector3()).project(camera);
      if (
        center.z < -1 ||
        center.z > 1 ||
        Math.abs(center.x) > 1.2 ||
        Math.abs(center.y) > 1.2
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
      item.button.textContent = atlasStructureName(structure) + side;
      item.button.setAttribute(
        "aria-label",
        `${atlasStructureName(structure)}${side} — cấu trúc mô hình nguồn`,
      );
      item.button.setAttribute(
        "aria-pressed",
        String(structure.id === selectedId),
      );
      item.button.dataset.selected = String(structure.id === selectedId);
      item.button.hidden = false;
      const w = item.button.offsetWidth;
      const h = item.button.offsetHeight;
      const labelSide = point.x < width / 2 ? 1 : -1;
      const x = THREE.MathUtils.clamp(
        point.x + labelSide * 30 - (labelSide < 0 ? w : 0),
        12,
        width - w - 12,
      );
      const y = THREE.MathUtils.clamp(point.y - h / 2, 12, height - h - 12);
      const rect = { x, y, width: w, height: h };
      if (bounds.some((other) => overlaps(rect, other))) {
        item.button.hidden = true;
        continue;
      }
      bounds.push(rect);
      item.button.style.cssText = `max-width:min(220px,60%);overflow-wrap:anywhere;line-height:1.35;text-align:left;left:${x}px;top:${y}px;border-color:${structure.id === selectedId ? "var(--cobalt)" : "var(--rule)"};`;
      const endX = labelSide > 0 ? x : x + w;
      const endY = y + h / 2;
      item.line.hidden = false;
      item.line.style.cssText = `position:absolute;height:1px;background:var(--slate);transform-origin:0 50%;pointer-events:none;left:${point.x}px;top:${point.y}px;width:${Math.hypot(endX - point.x, endY - point.y)}px;transform:rotate(${Math.atan2(endY - point.y, endX - point.x)}rad);`;
      count++;
    }
  }

  dispose() {
    for (const item of this.items)
      item.button.removeEventListener("click", item.click);
    this.root.remove();
  }
}
