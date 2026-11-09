/*
 * The image bed: GitHub's raw file host (raw.githubusercontent.com) and the Pages mirror of the same
 * repository. Both send `access-control-allow-origin: *`, so a picture from here can be painted onto
 * a canvas (the album pockets and postcards are canvas) without tainting it.
 *
 * Why a bed at all: the pictures live in one place (a repository of their own, uploaded with PicGo),
 * so adding a new one is a `git push` away and the site bundle stays small. The site's own
 * `public/photos/` still works for anything you want to keep with the code.
 *
 * A bed address is the file's name only (`plan-fig3.webp`); the base is added here, so a wrong
 * repository is a one-line fix.
 */

/** The bed: GitHub's raw host, by far the fastest of the two. */
export const BED_RAW = "https://raw.githubusercontent.com/hualala25/images/main/";

/** The bed's Pages mirror — the same files, served as a website. Slower than raw, but it survives raw's rate limits. */
export const BED_PAGES = "https://hualala25.github.io/images/";

/**
 * The bed's address for one file: `bed("plan-fig3.webp")`. A name that is already a full address is
 * left alone, so a picture kept in `public/` and one from the bed can be mixed freely.
 */
export function bed(file: string): string {
  if (!file) return file;
  if (/^(https?:)?\/\//.test(file) || file.startsWith("/") || file.startsWith("data:")) return file;
  return BED_RAW + file;
}

/**
 * The bed's address for one file, but on the Pages mirror. The album's canvas painters ask for
 * `crossOrigin="anonymous"`, and a picture that fails to load leaves the pocket empty rather than
 * broken — so the picture is asked for twice: the fast host first, the mirror second.
 */
export function bedAlt(file: string): string {
  if (!file) return file;
  if (/^(https?:)?\/\//.test(file) || file.startsWith("/") || file.startsWith("data:")) return file;
  return BED_PAGES + file;
}

/**
 * The mirror of an address on the raw host, or the address itself when it is not one.
 * The engine asks for a picture twice when the first try fails: the raw host is the fast one, the Pages
 * mirror the reliable one (raw rate-limits a CDN's worth of visitors; the mirror does not).
 */
export function altOf(src: string): string {
  if (!src || !src.startsWith(BED_RAW)) return src;
  return BED_PAGES + src.slice(BED_RAW.length);
}
