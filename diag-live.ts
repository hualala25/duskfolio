import { chromium } from "playwright-core";

/** 线上到底怎么了：多久出来、报什么错。 */
const b = await chromium.launch({
  args: ["--use-angle=metal", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"],
});
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

const msgs: string[] = [];
const failed: string[] = [];
p.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") msgs.push(`[${m.type()}] ${m.text().slice(0, 220)}`);
});
p.on("pageerror", (e) => msgs.push(`[PAGEERROR] ${String(e).slice(0, 300)}`));
p.on("requestfailed", (r) => failed.push(`${r.url().split("/").pop()} — ${r.failure()?.errorText ?? ""}`));

const t0 = Date.now();
await p.goto("https://hualala25.github.io/Assignment2/", { waitUntil: "load", timeout: 180000 });
console.log(`load: ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// 每 5 秒看一次状态，最多 90 秒
for (let i = 0; i < 18; i++) {
  await p.waitForTimeout(5000);
  const st = await p.evaluate(() => ({
    loading: document.querySelector(".page")?.getAttribute("data-loading"),
    dawn: document.querySelector(".dawn")?.textContent?.trim() ?? null,
    canvas: !!document.querySelector("canvas"),
    toc: document.querySelectorAll(".toc .n").length,
    body: document.body.innerText.trim().slice(0, 40),
  }));
  console.log(`${String((i + 1) * 5).padStart(3)}s  loading=${st.loading} dawn=${st.dawn ? "有" : "无"} canvas=${st.canvas} toc=${st.toc}`);
  if (st.loading === null && st.canvas) {
    console.log("→ 出来了");
    break;
  }
}

await p.screenshot({ path: "/tmp/live-broken.png" });
console.log("\n控制台:");
for (const m of [...new Set(msgs)].slice(0, 8)) console.log("  " + m);
if (!msgs.length) console.log("  （无）");
console.log("失败请求:", failed.length ? [...new Set(failed)].slice(0, 6) : "无");
await b.close();
