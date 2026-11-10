/**
 * 文件夹 → 站点内容
 *
 * 读 Assignment2/ 里的 YAML，写出 profile/generated.ts；同时把 images/ 里的本地图片
 * 复制到站点的 public/images/。
 *
 *   bun run sync
 *
 * 目录结构：
 *   Assignment2/
 *     site.yaml                 身份（名字、城市、账号）
 *     courses/NN-课程名/
 *       course.yaml             课程号、四个颜色、四张作业卡
 *     papers/pNN-短名/
 *       paper.yaml              标题、载体、摘要、颜色、封面、正文
 *     images/                   本地图片（会被复制进站点）
 *
 * 规则：
 * - 课程必须四张作业卡（册子每面 2×4 是物理结构）
 * - 颜色四个，由浅到深（明度严格递减），全站不重复
 * - 论文摘要中文 ≤82 字、英文 ≤157 字符（超了明信片背面会截断）
 * - cover / image 写文件名：images/ 里有同名文件就走本地，否则当图床文件名
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { parse } from "yaml";

/** 内容的家。想换地方就改这里，或设环境变量 CONTENT_ROOT。 */
const ROOT = process.env.CONTENT_ROOT ?? "/Users/luoyumo/Desktop/学习/课程/新媒体交互设计/Assignment2";

const SITE = join(import.meta.dir, "..");
const PUBLIC_IMAGES = join(SITE, "public", "images");
const OUT = join(SITE, "profile", "generated.ts");

const problems: string[] = [];
const notes: string[] = [];

/* ─────────────────────────────── 工具 ─────────────────────────────── */

const readYaml = (p: string): Record<string, unknown> => {
  try {
    return parse(readFileSync(p, "utf8")) ?? {};
  } catch (e) {
    problems.push(`${p}：YAML 读不了 —— ${(e as Error).message}`);
    return {};
  }
};

/** 目录名排序：01- 与 p01- 这类前缀天然按顺序排。 */
const sortedDirs = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => statSync(join(dir, n)).isDirectory())
    .filter((n) => !n.startsWith("."))
    .sort();
};

/** 相对明度（sRGB 线性化），用来检查「由浅到深」。 */
const luma = (hex: string): number => {
  const h = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};

/** 摘要要几行：明信片背面 65.4 mm 宽、5.6 mm 字、7 行。 */
const abstractLines = (text: string): number => {
  const W = 65.4, SIZE = 5.6;
  const mm = [...text].reduce((w, ch) => w + SIZE * (/[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? 1 : 0.52), 0);
  return Math.ceil(mm / W);
};
const MAX_LINES = 7;

/** 图片：images/ 里如果有同名文件，就复制进站点并用站点路径；否则当图床文件名。 */
const localImages = new Map<string, string>();
function resolveImage(name: string | undefined, owner: string): string | undefined {
  if (!name) return undefined;
  if (/^(https?:)?\/\//.test(name) || name.startsWith("data:")) return name;
  if (localImages.has(basename(name))) {
    const file = localImages.get(basename(name))!;
    return `images/${file}`;
  }
  // 不是本地文件：当图床文件名，原样交给 src/profile/bed.ts
  notes.push(`${owner} 的图 "${name}" 不在 images/ 里，按图床文件名处理`);
  return name;
}

/* ─────────────────────────────── 读内容 ─────────────────────────────── */

// 本地图片先建索引
if (existsSync(join(ROOT, "images"))) {
  mkdirSync(PUBLIC_IMAGES, { recursive: true });
  for (const f of readdirSync(join(ROOT, "images"))) {
    if (!/\.(webp|png|jpe?g|gif|avif)$/i.test(f) || f.startsWith(".")) continue;
    copyFileSync(join(ROOT, "images", f), join(PUBLIC_IMAGES, f));
    localImages.set(basename(f), f);
  }
  if (localImages.size) notes.push(`复制了 ${localImages.size} 张本地图片到 public/images/`);
}

// site.yaml
const site = readYaml(join(ROOT, "site.yaml"));
const IDENTITY = {
  name: String(site.name ?? ""),
  nameLocal: String(site.nameLocal ?? ""),
  handle: String(site.handle ?? ""),
  location: String(site.location ?? ""),
  locationEn: String(site.locationEn ?? ""),
  timezone: String(site.timezone ?? "Asia/Shanghai"),
};
for (const [k, v] of Object.entries(IDENTITY)) if (!v) problems.push(`site.yaml 缺 ${k}`);

// 课程
type Card = { zh: { name: string; note: string }; en: { name: string; note: string }; extra?: { src?: string; doc?: string } };
const courses: {
  code: string;
  colors: string[];
  zh: { course: string; cards: { name: string; note: string }[] };
  en: { course: string; cards: { name: string; note: string }[] };
  extra: ({ src?: string; doc?: string } | undefined)[];
}[] = [];

for (const dirName of sortedDirs(join(ROOT, "courses"))) {
  const p = join(ROOT, "courses", dirName, "course.yaml");
  if (!existsSync(p)) {
    problems.push(`courses/${dirName}/ 里没有 course.yaml`);
    continue;
  }
  const y = readYaml(p);
  const code = String(y.code ?? "");
  if (!/^[A-Z]{3}\d{3}$/.test(code)) problems.push(`${dirName}：课程号 "${code}" 要三个大写字母+三位数字，如 NME201`);

  const colors = (y.colors as string[] | undefined) ?? [];
  if (colors.length !== 4) problems.push(`${dirName}：colors 要有 4 个，现在是 ${colors.length}`);
  for (let i = 1; i < colors.length; i++) {
    if (luma(colors[i]!) >= luma(colors[i - 1]!)) problems.push(`${dirName}：第 ${i + 1} 个颜色不比第 ${i} 个深（要由浅到深）`);
  }

  const rawAssignments = (y.assignments as Record<string, any>[] | undefined) ?? [];
  if (rawAssignments.length !== 4) problems.push(`${dirName}：作业要 4 张，现在是 ${rawAssignments.length}（册子每面 2×4）`);

  const zhCards: { name: string; note: string }[] = [];
  const enCards: { name: string; note: string }[] = [];
  const extra: ({ src?: string; doc?: string } | undefined)[] = [];

  rawAssignments.forEach((a, i) => {
    const zh = (a.zh ?? {}) as Record<string, string>;
    const en = (a.en ?? {}) as Record<string, string>;
    zhCards.push({ name: String(zh.name ?? ""), note: String(zh.note ?? "") });
    enCards.push({ name: String(en.name ?? ""), note: String(en.note ?? "") });
    const src = resolveImage(zh.image, `${dirName} 第 ${i + 1} 张`);
    const doc = zh.doc ? String(zh.doc) : undefined;
    extra.push(src || doc ? { ...(src ? { src } : {}), ...(doc ? { doc } : {}) } : undefined);
    // 作业卡名太长会压边
    const len = [...String(zh.name ?? "")].length;
    if (len > 6) problems.push(`${dirName} 第 ${i + 1} 张：名字 ${len} 个字，卡面放不下（≤6）`);
  });
  while (extra.length < 4) extra.push(undefined);

  courses.push({
    code,
    colors,
    zh: { course: String((y.zh as any)?.course ?? ""), cards: zhCards },
    en: { course: String((y.en as any)?.course ?? ""), cards: enCards },
    extra,
  });
}

// 论文
const papers: {
  id: string;
  label: { zh: string; en: string };
  place: { zh: string; en: string };
  message: { zh: string; en: string };
  date?: string;
  color: string;
  src?: string;
  href?: { zh: string; en: string };
  doc?: string;
}[] = [];

for (const dirName of sortedDirs(join(ROOT, "papers"))) {
  const p = join(ROOT, "papers", dirName, "paper.yaml");
  if (!existsSync(p)) {
    problems.push(`papers/${dirName}/ 里没有 paper.yaml`);
    continue;
  }
  const y = readYaml(p);
  const id = String(y.id ?? "");
  if (!/^p\d{2}$/.test(id)) problems.push(`${dirName}：id "${id}" 要写成 p01 这样`);

  const label = (y.label ?? {}) as Record<string, string>;
  const place = (y.place ?? {}) as Record<string, string>;
  const message = (y.message ?? {}) as Record<string, string>;

  // 摘要长度 —— 超了明信片背面会静默截断
  for (const lang of ["zh", "en"] as const) {
    const text = String(message[lang] ?? "");
    if (!text) {
      problems.push(`${dirName}：缺 ${lang} 摘要`);
      continue;
    }
    const lines = abstractLines(text);
    if (lines > MAX_LINES) {
      problems.push(`${dirName}：${lang} 摘要要 ${lines} 行，超出背面的 ${MAX_LINES} 行，会被截断`);
    }
  }

  const color = String(y.color ?? "");
  if (!/^#[0-9a-f]{6}$/i.test(color)) problems.push(`${dirName}：color "${color}" 要写成 #rrggbb`);

  const cover = resolveImage(y.cover ? String(y.cover) : undefined, dirName);
  const docName = y.doc ? String(y.doc) : undefined;
  if (docName && !existsSync(join(SITE, "profile", "documents", `${docName}.ts`))) {
    problems.push(`${dirName}：正文 "${docName}" 不存在（先跑 bun run docx 生成 profile/documents/${docName}.ts）`);
  }

  papers.push({
    id,
    label: { zh: String(label.zh ?? ""), en: String(label.en ?? "") },
    place: { zh: String(place.zh ?? ""), en: String(place.en ?? "") },
    message: { zh: String(message.zh ?? ""), en: String(message.en ?? "") },
    ...(y.date ? { date: String(y.date) } : {}),
    color,
    ...(cover ? { src: cover } : {}),
    ...(y.download ? { href: { zh: String(y.download), en: String(y.download) } } : {}),
    ...(docName ? { doc: docName } : {}),
  });
}

// 论文 id 不能重
const ids = papers.map((p) => p.id);
for (const id of ids) {
  if (ids.filter((x) => x === id).length > 1) problems.push(`论文 id "${id}" 重复了`);
}

/* ─────────────────────────────── 写出 ─────────────────────────────── */

const head = `/*
 * 自动生成，别手改 —— 源头是：
 *   ${ROOT}
 *
 * 改内容是编辑那里的 YAML，然后跑 bun run sync。这个文件会被覆盖。
 * 生成时间：${new Date().toISOString().slice(0, 19).replace("T", " ")}
 */

`;

/**
 * JSON 把数组里的 undefined 写成 null（作业卡的空位就是这种情况），
 * 但 `CardExtra | undefined` 要的是 undefined。先标一个记号，再换回来。
 */
const ser = (v: unknown): string =>
  JSON.stringify(v, (_k, x) => (x === undefined ? "__U__" : x), 2).replace(/"__U__"/g, "undefined");

const body = `export const IDENTITY = ${ser(IDENTITY)};

export const COURSES = ${ser(courses)};

export const PAPERS = ${ser(papers)};
`;

mkdirSync(join(SITE, "profile"), { recursive: true });
writeFileSync(OUT, head + body, "utf8");

/* ─────────────────────────────── 报告 ─────────────────────────────── */

console.log(`同步完成 → profile/generated.ts`);
console.log(`  课程 ${courses.length} 门（${courses.reduce((n, c) => n + c.zh.cards.length, 0)} 张作业卡）`);
console.log(`  论文 ${papers.length} 篇`);
console.log(`  身份 ${IDENTITY.nameLocal || "（缺）"} / ${IDENTITY.name || "（缺）"}`);
for (const n of notes) console.log(`  · ${n}`);

if (problems.length) {
  console.log(`\n有 ${problems.length} 处需要改：`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exit(1);
}
console.log(`\n没有发现问题。下一步：bun test src && bun run build`);
