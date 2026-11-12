export const THEME_STORAGE_KEY = "kinesis-theme";

export const THEMES = [
  {
    id: "linen",
    name: "Linen",
    swatches: ["#F9F8F6", "#EFE9E3", "#D9CFC7", "#C9B59C"],
  },
  {
    id: "slate",
    name: "Slate",
    swatches: ["#213448", "#547792", "#94B4C1", "#EAE0CF"],
  },
  {
    id: "dusk",
    name: "Dusk",
    swatches: ["#81A6C6", "#AACDDC", "#F3E3D0", "#D2C4B4"],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME_ID: ThemeId = THEMES[0].id;

export function isThemeId(value: string | null): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

const THEME_IDS = THEMES.map((theme) => theme.id);

export const THEME_BOOT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var ids=${JSON.stringify(THEME_IDS)};if(ids.indexOf(t)>=0)document.documentElement.dataset.theme=t}catch(e){}`;
