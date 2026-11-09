import { chromium } from "playwright-core";

const BASE = "https://hualala25.github.io/Assignment2/";
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errs: string[] = [];
const bedReqs: string[] = [];
p.on("pageerror", (e) => errs.push("PAGEERROR " + String(e).slice(0, 200)));
p.on("console", (m) => {
  if (m.type() === "error") errs.push("ERR " + m.text().slice(0, 200));
});
p.on("request", (r) => {
  if (r.url().includes("hualala25/images") || r.url().includes("raw.githubusercontent")) bedReqs.push(r.url());
});

await p.goto(BASE, { waitUntil: "load" });
await p.waitForTimeout(14000);
await p.screenshot({ path: "/tmp/final/live-home.png" });

const st = await p.evaluate(() => ({
  canvas: !!document.querySelector("canvas"),
  fallback: !!document.querySelector(".panel[data-fallback]"),
  title: document.title,
  lang: document.documentElement.lang,
  name: document.querySelector(".words .id")?.textContent?.slice(0, 20),
}));
console.log("首页:", JSON.stringify(st));

// 图床
console.log("图床请求:", [...new Set(bedReqs)].map((u) => u.split("/").pop()).join(", ") || "（无）");

// 论文册 → 点开 → 读全文
await p.goto(BASE + "?lang=zh#postcards", { waitUntil: "load" });
await p.waitForTimeout(13000);
await p.screenshot({ path: "/tmp/final/live-postcards.png" });

const opened = await p.evaluate(() => {
  const a = [...document.querySelectorAll("a,button")].find((x) => (x.textContent || "").includes("细看「从「举起手机」"));
  if (!a) return "not found";
  (a as HTMLElement).click();
  return "clicked";
});
await p.waitForTimeout(2600);
console.log("打开论文:", opened);

const readBtn = await p.evaluate(() => {
  const btn = [...document.querySelectorAll("dialog.lb button")].find((b) => (b.textContent || "").trim() === "读全文");
  if (!btn) return false;
  (btn as HTMLElement).click();
  return true;
});
await p.waitForTimeout(3400);
await p.screenshot({ path: "/tmp/final/live-reading.png" });
console.log("读全文:", JSON.stringify(await p.evaluate(() => {
  const s = document.querySelector(".doc-sheet") as HTMLElement | null;
  return {
    clicked: true,
    sheet: !!s,
    w: s ? Math.round(s.getBoundingClientRect().width) : 0,
    paras: document.querySelectorAll(".doc-p").length,
    heads: document.querySelectorAll(".doc-h").length,
    title: document.querySelector(".doc-title")?.textContent?.slice(0, 30),
  };
})));

// 源码链接（AGPL）
console.log("源码链接:", await p.evaluate(() => {
  const a = [...document.querySelectorAll("a")].find((x) => (x.textContent || "").includes("源码") || (x.getAttribute("href") || "").includes("duskfolio"));
  return a?.getAttribute("href") ?? "（未找到）";
}));

console.log("errors:", errs.length ? errs.slice(0, 4) : "none");
await b.close();
