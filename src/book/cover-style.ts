import type { CoverColor, CoverFoil, CoverMaterial } from "./cover";

/*
 * The cover's colours and surface parameters (plain data, shared by the 3D scene and the 2D preview CoverPreview; no three).
 * The colours are low-saturation 和色 of a dusk: paper white, peach, cherry blossom, pale red, wisteria, amber, chrysanthemum,
 * pale rose, plum charcoal, ink, crimson — duskfolio: 桃 momo, 桜 sakura, 臙脂 enji (warm, for the dusk light).
 * - cloth and leather use base, the colour itself; frosted PP uses frost (a very faint tint; paper is the untinted milky white, ink a
 *   smoke grey)
 * - liner: the liner paper inside the cover (cloth and leather only; a light cover gets a near-white liner, a dark cover a dark liner
 *   of the same hue)
 */
export const COVER_HEX: Record<CoverColor, { base: string; frost: string; liner: string; dark: boolean }> = {
  shiro: { base: "#ece2dd", frost: "#f6ece9", liner: "#f6efea", dark: false },
  momo: { base: "#e0a096", frost: "#fce4dd", liner: "#fdf0ec", dark: false },
  sakura: { base: "#dca9bd", frost: "#f3dde9", liner: "#f9edf2", dark: false },
  usubeni: { base: "#d99aa8", frost: "#f0cdd6", liner: "#f4e0e5", dark: false },
  fuji: { base: "#bfb0ce", frost: "#dfd7ea", liner: "#e9e3f0", dark: false },
  kohaku: { base: "#d6ae86", frost: "#efd8bd", liner: "#f3e2cd", dark: false },
  kikka: { base: "#c6a052", frost: "#ebd8a8", liner: "#f1e3c0", dark: false },
  nissen: { base: "#e4bfbe", frost: "#f6dedd", liner: "#f9ebea", dark: false },
  ro: { base: "#3b2d34", frost: "#8f7f86", liner: "#48363e", dark: true },
  sumi: { base: "#2b1f24", frost: "#8b757c", liner: "#392931", dark: true },
  // duskfolio: the folio (a light liner in a dark case), the assignments, the papers
  enji: { base: "#8f2f43", frost: "#dcb8c2", liner: "#ecd8dd", dark: true },
};

/**
 * Foil stamps: silver and champagne-gold foil are metallic colours; blind has no colour, only a deboss (shown as the cover colour, a
 * little darker)
 */
export const FOIL_HEX: Record<Exclude<CoverFoil, "blind">, string> = {
  silver: "#dcd3d6",
  gold: "#dcbc78",
};

/**
 * Each material's surface parameters (for 3D): roughness, clearcoat, sheen (frosted PP is a very diffuse satin clearcoat: as the case
 * opens and shuts the softbox's reflection slides across the boards, see frost.ts)
 */
export const MATERIAL_LOOK: Record<CoverMaterial, { roughness: number; clearcoat: number; sheen: number }> = {
  frost: { roughness: 0.5, clearcoat: 0.3, sheen: 0 },
  cloth: { roughness: 0.86, clearcoat: 0, sheen: 0.7 },
  leather: { roughness: 0.5, clearcoat: 0.25, sheen: 0.15 },
};
