export const THEME_STORAGE_KEY = "kinesis-theme";

export const THEMES = [
  {
    id: "tide",
    name: "Ocean Sunset",
    swatches: [
      "#001219",
      "#005F73",
      "#0A9396",
      "#94D2BD",
      "#E9D8A6",
      "#EE9B00",
      "#CA6702",
      "#BB3E03",
      "#AE2012",
      "#9B2226",
    ],
  },
  {
    id: "pacific",
    name: "Ocean Blue Serenity",
    swatches: [
      "#03045E",
      "#023E8A",
      "#0077B6",
      "#0096C7",
      "#00B4D8",
      "#48CAE4",
      "#90E0EF",
      "#ADE8F4",
      "#CAF0F8",
    ],
  },
  {
    id: "canopy",
    name: "Warm Neutral Tones",
    swatches: [
      "#582F0E",
      "#7F4F24",
      "#936639",
      "#A68A64",
      "#B6AD90",
      "#C2C5AA",
      "#A4AC86",
      "#656D4A",
      "#414833",
      "#333D29",
    ],
  },
  {
    id: "sunny-beach",
    name: "Sunny Beach Day",
    swatches: ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
  },
  {
    id: "summer-ocean",
    name: "Summer Ocean Breeze",
    swatches: ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
  },
  {
    id: "earthy-forest",
    name: "Earthy Forest Hues",
    swatches: ["#DAD7CD", "#A3B18A", "#588157", "#3A5A40", "#344E41"],
  },
  {
    id: "olive-garden",
    name: "Olive Garden Feast",
    swatches: ["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"],
  },
  {
    id: "summer-fun",
    name: "Refreshing Summer Fun",
    swatches: ["#8ECAE6", "#219EBC", "#023047", "#FFB703", "#FB8500"],
  },
  {
    id: "autumn-glow",
    name: "Warm Autumn Glow",
    swatches: ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7"],
  },
  {
    id: "black-gold",
    name: "Black & Gold Elegance",
    swatches: ["#000000", "#14213D", "#FCA311", "#E5E5E5", "#FFFFFF"],
  },
  {
    id: "deep-sea",
    name: "Deep Sea",
    swatches: ["#0D1321", "#1D2D44", "#3E5C76", "#748CAB", "#F0EBD8"],
  },
  {
    id: "earthy-green",
    name: "Earthy Green",
    swatches: ["#CAD2C5", "#84A98C", "#52796F", "#354F52", "#2F3E46"],
  },
  {
    id: "fresh-greens",
    name: "Fresh Greens",
    swatches: ["#386641", "#6A994E", "#A7C957", "#F2E8CF", "#BC4749"],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export function isThemeId(value: string | null): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

const THEME_IDS = THEMES.map((theme) => theme.id);

export const THEME_BOOT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var ids=${JSON.stringify(THEME_IDS)};if(ids.indexOf(t)>=0)document.documentElement.dataset.theme=t}catch(e){}`;
