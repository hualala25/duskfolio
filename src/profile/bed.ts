/*
 * The image bed: one repository of pictures (`hualala25/images`, uploaded with PicGo), reached two ways —
 * its Pages site and GitHub's raw file host. Both send `access-control-allow-origin: *`, so a picture from
 * here can be painted onto a canvas (the album pockets and postcards are canvas) without tainting it.
 *
 * Why a bed at all: the pictures live in one place, so adding a new one is a `git push` away and the site
 * bundle stays small. The site's own `public/photos/` still works for anything you want to keep with the
 * code.
 *
 * ── which host comes first (2026-11-10) ────────────────────────────────────────────────────────────────
 * The Pages mirror, not raw. Measured from a mainland connection: **raw.githubusercontent.com failed all
 * three ways** — a plain <img>, a crossOrigin <img>, and fetch() — while the mirror loaded the same file
 * (1600 px, 26 KB) every time. That is the usual state of raw in the mainland (DNS pollution and
 * throttling), and it fails *silently*: the pocket simply stays empty, nothing in the console says the
 * picture is missing.
 *
 * Note that a crossOrigin image which fails for *any* reason (network, DNS, timeout) is reported by the
 * browser as a CORS error — the console line names CORS even when CORS is fine. That is why this looked
 * like a header problem at first; the headers were correct all along.
 *
 * So: the mirror is the base, raw is the fallback. A bed address is the file's name only
 * (`plan-fig3.webp`); the base is added here, so switching hosts is a one-line change.
 */

/** The bed's main host: the repository's Pages site. Reachable from the mainland; see the note above. */
export const BED_PAGES = "https://hualala25.github.io/images/";

/** The bed's fallback host: GitHub's raw file host. Faster abroad, unreliable (often unreachable) in the mainland. */
export const BED_RAW = "https://raw.githubusercontent.com/hualala25/images/main/";

/**
 * The bed's address for one file: `bed("plan-fig3.webp")`. A name that is already a full address is
 * left alone, so a picture kept in `public/` and one from the bed can be mixed freely.
 */
export function bed(file: string): string {
  if (!file) return file;
  if (/^(https?:)?\/\//.test(file) || file.startsWith("/") || file.startsWith("data:")) return file;
  // 站点自己的 public/ 资源（sync 从课程文件夹复制过来的图）：原样交给浏览器，按 base 解析
  if (/^(images|papers|photos)\//.test(file)) return file;
  return BED_PAGES + file;
}

/**
 * The same file on the fallback host. The engine asks for a picture twice when the first try fails:
 * the mirror first, raw second.
 */
export function bedAlt(file: string): string {
  if (!file) return file;
  if (/^(https?:)?\/\//.test(file) || file.startsWith("/") || file.startsWith("data:")) return file;
  return BED_RAW + file;
}

/**
 * The fallback form of an address: a mirror address becomes its raw twin, anything else is returned as
 * given. The engine calls this once when a picture fails to load, so a mirror outage (or a Pages build in
 * progress) still has a second chance.
 */
export function altOf(src: string): string {
  if (!src || !src.startsWith(BED_PAGES)) return src;
  return BED_RAW + src.slice(BED_PAGES.length);
}
