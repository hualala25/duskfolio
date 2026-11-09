import { chromium } from "playwright-core";

const BASE = "https://hualala25.github.io/Assignment2/";
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const pending = new Map<string, number>();
p.on("request", (r) => pending.set(r.url(), Date.now()));
p.on("requestfinished", (r) => pending.delete(r.url()));
p.on("requestfailed", (r) => pending.delete(r.url()));

await p.goto(BASE, { waitUntil: "load" });
for (const t of [5000, 15000, 30000]) {
  await p.waitForTimeout(t === 5000 ? 5000 : 10000);
  const st = await p.evaluate(() => ({
    canvas: !!document.querySelector("canvas"),
    folioBook: !!document.querySelector(".folio-book"),
    mode: document.querySelector(".folio-book")?.getAttribute("data-mode"),
    ready: document.querySelector(".stage-host")?.hasAttribute("data-ready"),
    dawnText: document.querySelector(".dawn span")?.textContent,
    progress: document.querySelector(".dawn")?.getAttribute("style"),
  }));
  const still = [...pending.keys()].map((u) => u.split("/").pop());
  console.log(`${t / 1000}s:`, JSON.stringify(st), still.length ? `\n   还在等: ${still.slice(0, 6).join(", ")}` : "");
}

// 看看 three.js 模块加载了没
console.log("\n关键资源状态:");
for (const name of ["three", "index", "ResumeStage"]) {
  const r = await p.evaluate((n) => performance.getEntriesByType("resource").filter((x) => x.name.includes(n)).map((x) => `${x.name.split("/").pop()} ${Math.round(x.duration)}ms ${x.transferSize}B`), name);
  console.log(` ${name}:`, r.slice(0, 4).join(" | ") || "（未请求）");
}
await b.close();
