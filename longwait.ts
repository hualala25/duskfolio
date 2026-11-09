import { chromium } from "playwright-core";

const BASE = "https://hualala25.github.io/Assignment2/";
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const t0 = Date.now();
await p.goto(BASE, { waitUntil: "load" });

// 最多等 150 秒，看它到底能不能加载完
for (let i = 0; i < 15; i++) {
  await p.waitForTimeout(10000);
  const st = await p.evaluate(() => ({
    canvas: !!document.querySelector("canvas"),
    ready: document.querySelector(".stage-host")?.hasAttribute("data-ready"),
    dawn: !!document.querySelector(".dawn"),
  }));
  const s = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`${s}s:`, JSON.stringify(st));
  if (st.canvas && st.ready) {
    console.log(`\n✓ 加载完成，用了 ${s} 秒`);
    await p.screenshot({ path: "/tmp/final/live-loaded.png" });
    break;
  }
}
await b.close();
