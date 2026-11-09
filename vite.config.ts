import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { folio } from "./profile";
import { dictFor } from "./src/app/i18n";
import { loadProfile } from "./src/profile/folio";

/**
 * The fontsource CSS gives every slice a .woff fallback after its .woff2 (`url(…woff2) format("woff2"), url(…woff) format("woff")`),
 * and the build emits every file a CSS url() names: about 700 .woff files (≈ 21 MB) that no browser able to run the folio (WebGL 2)
 * would ever fetch. The fallbacks are dropped before Vite resolves the URLs, so only the woff2 ship. (`?raw` CSS is read by src/fonts
 * itself, which takes the woff2 only.)
 */
function woff2Only(): Plugin {
  return {
    name: "folio:woff2-only",
    enforce: "pre",
    transform(code, id) {
      const [path, query = ""] = id.split("?");
      if (!/\/node_modules\/(@fontsource\/|lxgw-wenkai-webfont\/)[^?]*\.css$/.test(path!) || /(^|&)raw(&|$)/.test(query)) return null;
      return { code: code.replace(/,\s*url\([^)]*\.woff\)\s*format\(\s*["']?woff["']?\s*\)/g, ""), map: null };
    },
  };
}

/**
 * index.html's language, title and description (and their Open Graph twins) from the folio's first profile, so a link preview, which
 * runs no script, shows the person rather than the project. The page sets the title and language again as it runs.
 */
function profileMeta(): Plugin {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return {
    name: "folio:profile-meta",
    async transformIndexHtml(html) {
      const p = await loadProfile(folio, folio.primary);
      const t = dictFor(p);
      const title = esc(t.meta.title(p, "folio"));
      const description = esc(t.meta.description(p));
      return html
        .replace(/<html lang="[^"]*">/, `<html lang="${t.htmlLang}">`)
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*/g, `$1${description}`)
        .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`);
    },
  };
}

/**
 * The engine's own chunks, fetched in parallel with the fonts.
 *
 * The 3D book's modules are lazy (the folio's first paint does not need them), so the browser only
 * discovers them after the page's JavaScript has run — and by then the font slices have taken every
 * connection the browser will open. On a slow link the engine's three.js (700 kB) then waited behind
 * forty small font files, and the page sat on its loading line for half a minute.
 *
 * This writes a `<link rel="modulepreload">` for the three chunks the first screen needs (the engine,
 * its bag of objects and the paper viewer), so they are fetched from the first byte, beside the fonts
 * rather than after them.
 */
function preloadEngine(): Plugin {
  return {
    name: "folio:preload-engine",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      const html = Object.values(bundle).find((c) => c.type === "asset" && c.fileName.endsWith("index.html"));
      if (!html || html.type !== "asset" || typeof html.source !== "string") return;
      // the chunks the first screen needs: three.js itself, the engine's scene and its bag of objects
      // (the paper viewer and the typesetter only matter once a document is opened — they are left alone)
      const wanted = ["three.module", "bag-", "scene-", "light-"];
      const links = Object.keys(bundle)
        .filter((f) => f.endsWith(".js") && wanted.some((w) => f.includes(`assets/${w}`)))
        .map((f) => `    <link rel="modulepreload" href="./${f}" crossorigin />`);
      if (!links.length) return;
      const tag = `${links.join("\n")}\n`;
      html.source = html.source.replace("</head>", `${tag}  </head>`);
    },
  };
}

/** `base: "./"`: every URL the build writes is relative, so the same files work at a domain's root and under a sub-path (GitHub Pages' /<repo>/). */
export default defineConfig({ base: "./", plugins: [woff2Only(), profileMeta(), preloadEngine(), react()], server: { port: 5188, host: "127.0.0.1" } });
