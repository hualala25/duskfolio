import { chromium } from "playwright-core";

const BASE = "https://hualala25.github.io/Assignment2/";
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const failed: string[] = [];
const slow: { url: string; ms: number }[] = [];
p.on("requestfailed", (r) => failed.push(`${r.failure()?.errorText} ${r.url().slice(0, 110)}`));
p.on("response", (r) => {
  if (r.status() >= 400) failed.push(`HTTP ${r.status()} ${r.url().slice(0, 110)}`);
});

const t0 = Date.now();
await p.goto(BASE, { waitUntil: "load" });
await p.waitForTimeout(30000);

console.log("30 秒后的状态:", JSON.stringify(await p.evaluate(() => ({
  canvas: !!document.querySelector("canvas"),
  loading: !!document.querySelector(".dawn"),
  loadingText: document.querySelector(".dawn span")?.textContent,
  fallback: !!document.querySelector(".panel[data-fallback]"),
}))));

console.log("\n失败请求:", failed.length ? failed.slice(0, 10).join("\n  ") : "无");
console.log("\n总耗时:", ((Date.now() - t0) / 1000).toFixed(1), "秒");

// 看看有多少资源被请求了
const res = await p.evaluate(() => performance.getEntriesByType("resource").length);
console.log("资源请求数:", res);
const fonts = await p.evaluate(() => performance.getEntriesByType("resource").filter((r) => r.name.includes(".woff2")).length);
console.log("字体请求数:", fonts);
await b.close();
