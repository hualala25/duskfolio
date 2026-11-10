/**
 * profile/content.ts → 文件夹（一次性迁移）
 *
 * 把这个站点现在的内容，按「一人一目录」的 YAML 结构导出到课程文件夹，
 * 之后就在文件夹里改，用 scripts/sync-content.ts 反向同步回站点。
 *
 *   bun run scripts/export-content.ts [目标目录]
 *
 * 不带参数时用下面的 CONTENT_ROOT。
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { stringify as yamlStringify } from "yaml";

/** 不折行：一条 note 一行，手改时看得清。 */
const stringify = (v: unknown) => yamlStringify(v, { lineWidth: 0 });
import { COURSES, IDENTITY, PAPERS } from "../profile/content";

/** 内容的家：课程文件夹里的 Assignment2。改这里就能换地方。 */
const CONTENT_ROOT = process.env.CONTENT_ROOT ?? "/Users/luoyumo/Desktop/学习/课程/新媒体交互设计/Assignment2";

/** 标题里不适合做目录名的字符去掉，再截断 —— 只是给人看的排序线索，id 才是唯一标识。 */
const slug = (s: string, max = 14) =>
  s
    .replace(/[「」《》：:，,。.、／/\\|*?"<>]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, max);

function main() {
  const root = process.argv[2] ?? CONTENT_ROOT;
  const coursesDir = join(root, "courses");
  const papersDir = join(root, "papers");
  mkdirSync(coursesDir, { recursive: true });
  mkdirSync(papersDir, { recursive: true });
  mkdirSync(join(root, "images"), { recursive: true });

  // ── site.yaml：身份 ────────────────────────────────────────────────────
  const site = {
    // 中文名印在名牌、藏书票、小篆名章、简历页眉
    nameLocal: IDENTITY.nameLocal,
    // 拉丁名印在英文版的名牌
    name: IDENTITY.name,
    handle: IDENTITY.handle,
    location: IDENTITY.location,
    locationEn: IDENTITY.locationEn,
    timezone: IDENTITY.timezone,
  };
  writeFileSync(
    join(root, "site.yaml"),
    `# 站点身份 —— 改完记得跑 bun run sync\n${stringify(site)}`,
    "utf8",
  );

  // ── courses/NN-课程名/course.yaml ──────────────────────────────────────
  let ci = 0;
  for (const c of COURSES) {
    ci++;
    const dirName = `${String(ci).padStart(2, "0")}-${slug(c.zh.course)}`;
    const dir = join(coursesDir, dirName);
    mkdirSync(dir, { recursive: true });

    // 四张作业卡：中英各一份，图与正文挂在卡上
    const cards = c.zh.cards.map((card, i) => {
      const zh: Record<string, unknown> = { name: card.name, note: card.note };
      const extra = c.extra?.[i];
      if (extra?.src) zh.image = extra.src;
      if (extra?.doc) zh.doc = extra.doc;
      return {
        zh,
        en: { name: c.en.cards[i]!.name, note: c.en.cards[i]!.note },
      };
    });

    const doc = {
      code: c.code,
      colors: [...c.colors],
      zh: { course: c.zh.course },
      en: { course: c.en.course },
      assignments: cards,
    };
    writeFileSync(
      join(dir, "course.yaml"),
      `# ${c.zh.course} —— 必须四张作业卡，颜色由浅到深\n${stringify(doc)}`,
      "utf8",
    );
  }

  // ── papers/pNN-短名/paper.yaml ─────────────────────────────────────────
  for (const p of PAPERS) {
    const dirName = `${p.id}-${slug(p.label.zh)}`;
    const dir = join(papersDir, dirName);
    mkdirSync(dir, { recursive: true });

    const doc: Record<string, unknown> = {
      id: p.id,
      label: p.label,
      place: p.place,
      message: p.message,
      color: p.color,
    };
    if (p.date) doc.date = p.date;
    if (p.src) doc.cover = p.src;
    if (p.href) doc.download = p.href.zh;
    if (p.doc) doc.doc = p.doc;
    writeFileSync(
      join(dir, "paper.yaml"),
      `# ${p.label.zh}\n# 摘要：中文 ≤82 字 / 英文 ≤157 字符，超了会被截断\n${stringify(doc)}`,
      "utf8",
    );
  }

  console.log(`导出到 ${root}`);
  console.log(`  课程 ${COURSES.length} 门 → courses/`);
  console.log(`  论文 ${PAPERS.length} 篇 → papers/`);
  console.log(`  身份 → site.yaml`);
  if (!existsSync(join(root, "images"))) console.log("  （images/ 已建，把本地图片放这里）");
}

main();
