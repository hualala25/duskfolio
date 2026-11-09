import { chromium } from "playwright-core";

const BASE = "https://hualala25.github.io/Assignment2/";
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const t0 = Date.now();
const marks: { url: string; at: number; size: number }[] = [];
p.on("response", async (r) => {
  try {
    const buf = await r.body().catch(() => null);
    marks.push({ url: r.url(), at: Date.now() - t0, size: buf?.length ?? 0 });
  } catch {
    /* the body is gone (a redirect) */
  }
});

await p.goto(BASE, { waitUntil: "load" });
await p.waitForTimeout(22000);

console.log("=== 最晚完成的 12 个 ===");
marks.sort((a, b) => b.at - a.at).slice(0, 12).forEach((m) => console.log(`  ${String(m.at).padStart(6)}ms  ${(m.size / 1024).toFixed(0).padStart(6)}KB  ${m.url.split("/").pop()?.slice(0, 55)}`));

const total = marks.reduce((s, m) => s + m.size, 0);
console.log(`\n总传输: ${(total / 1024 / 1024).toFixed(1)} MB，${marks.length} 个请求`);
const fonts = marks.filter((m) => m.url.includes(".woff2"));
console.log(`字体: ${fonts.length} 个，${(fonts.reduce((s, m) => s + m.size, 0) / 1024).toFixed(0)} KB`);
const js = marks.filter((m) => m.url.endsWith(".js"));
console.log(`JS: ${js.length} 个，${(js.reduce((s, m) => s + m.size, 0) / 1024).toFixed(0)} KB`);
await b.close();
