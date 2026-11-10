/**
 * 一条命令：文件夹 → 线上
 *
 *   bun run publish
 *
 * 依次做：
 *   1. sync   读 Assignment2/ 的 YAML，写 profile/generated.ts，复制本地图片
 *   2. test   跑 364 个测试（形状、字数、排版约束）—— 不过就停，不会带着错上线
 *   3. build  构建
 *   4. 推送源码仓库（AGPL 要求公开源码）
 *   5. 把 dist/ 同步到 pages-repo/Assignment2/ 并推送，GitHub Actions 自动发布
 *
 * 任何一步失败都会停下并告诉你卡在哪，不会出现「站点更新了但源码没更新」这种半截状态。
 */
import { $ } from "bun";
import { existsSync } from "node:fs";
import { join } from "node:path";

const SITE = join(import.meta.dir, "..");
const PAGES = join(SITE, "..", "pages-repo");
const PAGES_SUB = join(PAGES, "Assignment2");

const step = (n: string) => console.log(`\n── ${n} ──`);

try {
  step("1/5 同步内容");
  await $`bun run scripts/sync-content.ts`.cwd(SITE);

  step("2/5 跑测试");
  await $`bun test src`.cwd(SITE);

  step("3/5 构建");
  await $`bun run build`.cwd(SITE);

  step("4/5 推送源码");
  const dirty = (await $`git status --porcelain`.cwd(SITE).text()).trim();
  if (dirty) {
    await $`git add -A`.cwd(SITE);
    await $`git commit -m ${"内容更新（bun run publish）"}`.cwd(SITE);
    await $`git push origin main`.cwd(SITE);
  } else {
    console.log("  源码没有变化，跳过");
  }

  step("5/5 发布到 Pages");
  if (!existsSync(PAGES)) {
    console.log(`  ✗ 找不到 ${PAGES}`);
    console.log("    发布要那个仓库：gh repo clone hualala25/hualala25.github.io " + PAGES);
    process.exit(1);
  }
  await $`rsync -a --delete --exclude .gitkeep ${join(SITE, "dist")}/ ${PAGES_SUB}/`;
  await $`git add -A`.cwd(PAGES);
  const pagesDirty = (await $`git status --porcelain`.cwd(PAGES).text()).trim();
  if (pagesDirty) {
    await $`git commit -m ${"Assignment2：内容更新"}`.cwd(PAGES);
    await $`git push origin main`.cwd(PAGES);
    console.log("\n已推送。GitHub Actions 约 2 分钟后发布完成：");
    console.log("  https://hualala25.github.io/Assignment2/");
  } else {
    console.log("  发布目录没有变化，跳过");
  }
} catch (e) {
  console.log("\n✗ 停在了上面那一步。修好再跑一次 bun run publish。");
  process.exit(1);
}
