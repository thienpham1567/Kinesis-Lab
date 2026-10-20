import { surfaceLabelPoint } from "./surface-label-layout.mjs";
import { GLUTEUS_MEDIUS_IDS } from "../../lib/clinical/anatomy-evidence.mjs";
/** DOM overlay owned with the renderer. No React render loop on orbit.
 * @param {HTMLElement} host @param {(kind:string)=>void} focus */
export class SurfaceLabels {
  /** @param {HTMLElement} host @param {(kind:string)=>void} focus */
  constructor(host, focus) {
    this.root = document.createElement("div");
    this.root.className = "absolute inset-0 pointer-events-none";
    this.root.setAttribute("role", "group");
    this.root.setAttribute("aria-label", "Nhãn vùng cơ mông nhỡ");
    host.appendChild(this.root);
    this.items = [
      ["muscle", "Thân cơ"],
      ["tendon", "Vùng gân"],
    ].map(([kind, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.hidden = true;
      button.className =
        "absolute pointer-events-auto rounded-lg border border-rule bg-sheet px-3 py-2 text-xs font-semibold text-ink shadow-sm focus-visible:outline-2 focus-visible:outline-cobalt";
      button.style.transform = "translate(-50%,-50%)";
      button.setAttribute(
        "aria-label",
        "Xem sát " + label.toLowerCase() + " — vùng mesh nguồn",
      );
      button.title =
        "Vùng phân loại trong mô hình nguồn; bấm để xem sát. Không phải mốc bám giải phẫu đã đo.";
      const click = () => focus(kind);
      button.addEventListener("click", click);
      this.root.appendChild(button);
      return { kind, button, click };
    });
  }
  /** @param {string|null} id @param {boolean} enabled @param {Map<string,import('three').Mesh[]>} map @param {import('three').PerspectiveCamera} camera @param {number} width @param {number} height */
  update(id, enabled, map, camera, width, height) {
    const active = enabled && id !== null && GLUTEUS_MEDIUS_IDS.includes(id);
    let previous = null;
    for (const item of this.items) {
      const own = id ? (map.get(id) ?? []) : [],
        point = active
          ? surfaceLabelPoint(
              own.filter((m) => m.userData.tissueKind === item.kind),
              [...map.values()].flat(),
              camera,
              width,
              height,
            )
          : null;
      item.button.hidden = !point;
      if (point) {
        const y = point.y;
        if (
          previous &&
          Math.abs(point.x - previous.x) < 140 &&
          Math.abs(y - previous.y) < 44
        ) {
          item.button.hidden = true;
          continue;
        }
        item.button.style.left = point.x + "px";
        item.button.style.top = y + "px";
        previous = { x: point.x, y };
      }
    }
  }
  dispose() {
    for (const item of this.items)
      item.button.removeEventListener("click", item.click);
    this.root.remove();
  }
}
