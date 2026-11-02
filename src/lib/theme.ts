export const THEME_STORAGE_KEY = "kinesis-theme";

export const THEMES = [
  {
    id: "linen",
    name: "Linen",
    swatches: ["#F9F8F6", "#EFE9E3", "#D9CFC7", "#C9B59C"],
  },
  {
    id: "blush",
    name: "Blush",
    swatches: ["#FCF8F8", "#FBEFEF", "#F9DFDF", "#F5AFAF"],
  },
  {
    id: "navy",
    name: "Navy",
    swatches: ["#0F2854", "#1C4D8D", "#4988C4", "#BDE8F5"],
  },
  {
    id: "coral",
    name: "Coral",
    swatches: ["#FEEAC9", "#FFCDC9", "#FDACAC", "#FD7979"],
  },
  {
    id: "mint",
    name: "Mint",
    swatches: ["#A8DF8E", "#F0FFDF", "#FFD8DF", "#FFAAB8"],
  },
  {
    id: "sage",
    name: "Sage",
    swatches: ["#F1F3E0", "#D2DCB6", "#A1BC98", "#778873"],
  },
  {
    id: "wine",
    name: "Wine",
    swatches: ["#FCF5EE", "#FFC4C4", "#EE6983", "#850E35"],
  },
  {
    id: "slate",
    name: "Slate",
    swatches: ["#213448", "#547792", "#94B4C1", "#EAE0CF"],
  },
  {
    id: "olive",
    name: "Olive",
    swatches: ["#F6F0D7", "#C5D89D", "#9CAB84", "#89986D"],
  },
  {
    id: "sky",
    name: "Sky",
    swatches: ["#355872", "#7AAACE", "#9CD5FF", "#F7F8F0"],
  },
  {
    id: "dusk",
    name: "Dusk",
    swatches: ["#81A6C6", "#AACDDC", "#F3E3D0", "#D2C4B4"],
  },
  {
    id: "lilac",
    name: "Lilac",
    swatches: ["#F2EAE0", "#B4D3D9", "#BDA6CE", "#9B8EC7"],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME_ID: ThemeId = THEMES[0].id;

export function isThemeId(value: string | null): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

const THEME_IDS = THEMES.map((theme) => theme.id);

export const THEME_BOOT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var ids=${JSON.stringify(THEME_IDS)};if(ids.indexOf(t)>=0)document.documentElement.dataset.theme=t}catch(e){}`;
