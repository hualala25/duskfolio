import { COVER_HEX } from "../book/cover-style";
import { COVER_MATERIALS, type CoverColor, type CoverFoil, type CoverMaterial } from "../book/cover";
import type { LayoutPreset } from "../book/layout";
import type { ItemKind, Profile } from "../profile/schema";
import type { Dict } from "./i18n";
import { TAB_IDS, type Tab } from "./types";

/*
 * The three booklets on the desk (spec §2.4): each case's colour and foil are fixed per booklet; the material is
 * frosted PP for all three (the owner dropped cloth and leather, 2026-11-09) and is not the visitor's to switch;
 * the words for them (names, local titles, handling lines) live in i18n.ts.
 *   Assignments 桃 momo,    silver foil, frosted PP; 2 × 4 card pockets a side
 *   Papers      桜 sakura,  blind stamp, frosted PP; 2 × 3 A6 pockets a side
 *   CV          臙脂 enji,  silver foil, frosted PP
 * The albums' pages are tall (brief r3 D3): an open spread of 2 × 3 cards or 2 × 2 postcards is so wide that it is small on a desk.
 */

export type Booklet = {
  id: Tab;
  color: CoverColor;
  foil: CoverFoil;
  /** The material when the visitor has not picked one. */
  material: CoverMaterial;
  /** The Japanese local title (the English page's hashira and 題簽 slip); a Chinese page uses i18n's. */
  local: string;
  /** The albums' pocket grid (src/book/layout.ts). */
  layout?: LayoutPreset;
};

export const BOOKLETS: readonly Booklet[] = [
  { id: "cards", color: "momo", foil: "silver", material: "frost", local: "課題帖", layout: "idCard2x4" },
  { id: "postcards", color: "sakura", foil: "blind", material: "frost", local: "論集", layout: "postcard2x3" },
  { id: "resume", color: "enji", foil: "silver", material: "frost", local: "経歴書" },
];

/** The local name of each pouch kind (the English page's; a Chinese page uses i18n's `held`). */
export const LOCAL_KIND: Record<ItemKind, string> = { card: "名刺", resume: "経歴書", ticket: "課題票", polaroid: "写真", note: "一筆箋" };

export const booklet = (id: Tab): Booklet => BOOKLETS.find((b) => b.id === id) ?? BOOKLETS[2]!;

/** How many things a booklet holds (the count after its name). */
export function countOf(profile: Profile, id: Tab): number {
  return id === "resume" ? profile.items.length : profile.albums[id].length;
}

/** The local title of a booklet (hashira, 題簽 slip): 課題帖 / 論集 / 経歴書, or 课程作业 / 论文 / 学术履历 for a Chinese page. */
export const localTitle = (t: Dict, id: Tab) => t.booklet[id].local;

/**
 * The materials the page offers: frosted PP only. The engine can draw cloth and leather too (src/book/cover.ts keeps
 * them), but the site does not offer them — every booklet on the desk is frosted, and there is nothing to switch.
 */
export const MATERIALS = ["frost"] as const satisfies readonly CoverMaterial[];
/** The swatch colours of a booklet's case: the frosted PP's tint. The UI never invents its own. */
export const caseHex = (b: Booklet) => COVER_HEX[b.color];
