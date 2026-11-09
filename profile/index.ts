import type { Folio } from "../src/profile/folio";
import { profileZh } from "./zh";

/*
 * Your page's content: this folder and the pictures in public/photos are all you need to change
 * (README, "Make it yours").
 *
 * Two languages, one shape: Simplified Chinese (zh.ts, in the entry chunk — the one visitors see
 * first) and English (en.ts, its own chunk, fetched the first time a visitor picks English or
 * arrives with ?lang=en). Both are built from the same skeleton in content.ts, so they describe
 * the same things and differ only in their words.
 *
 * One language only: export `{ primary: "zh", profiles: { zh: profileZh } }` and delete en.ts —
 * the page then shows no language switch.
 */
export const folio: Folio = {
  primary: "zh",
  profiles: {
    zh: profileZh,
    en: () => import("./en").then((m) => m.profile),
  },
};
