/*
 * 站点的内容 —— 现在从这里搬到了文件夹。
 *
 * 真正的数据在：
 *   ~/Desktop/学习/课程/新媒体交互设计/Assignment2/
 *     site.yaml                 名字、城市、账号
 *     courses/NN-课程名/course.yaml
 *     papers/pNN-短名/paper.yaml
 *     images/                   本地图片
 *
 * 改完跑 `bun run sync`，它重新生成 profile/generated.ts（这个文件导入的就是它）。
 * 这个文件只留类型和一层薄包装，不放内容 —— 免得两处都能改、然后对不上。
 *
 * ── 三条硬约束（超了 bun test src 会直接告诉你）────────────────────────────
 *   1. 卡片上的中文作业名 ≤ 6 字、英文 ≤ 20 字符（卡面 85.6 mm 宽、4 mm 字）
 *   2. 论文摘要：中文 ≤ 82 字、英文 ≤ 157 字符（明信片背面 65.4 mm 宽、5.6 mm 字、七行）
 *   3. 履历里的组织名：英文 ≤ 24 字符、中文 ≤ 12 全角（A4 内容列 123.9 mm，扣掉年份栏）
 *
 * 前两条 sync 会提前检查；第三条要等 bun test src。
 */

import { COURSES as GEN_COURSES, IDENTITY as GEN_IDENTITY, PAPERS as GEN_PAPERS } from "./generated";

export type AssignmentText = { name: string; note: string };

export type CourseEntry = {
  /** 印在卡片上的课程号（拉丁字母，窄，比汉字好排）。 */
  code: string;
  /** 这门课四个作业卡的颜色，由浅到深。个数与明度顺序由 sync 检查（YAML 是运行时数据，类型管不到）。 */
  colors: readonly string[];
  zh: { course: string; cards: readonly AssignmentText[] };
  en: { course: string; cards: readonly AssignmentText[] };
};

/**
 * 一门课里的一张作业卡，多出来的东西：
 * - src: 这张卡的图（图床上的文件名，或站点自己的 images/ 路径）
 * - doc: 这份作业的正文（profile/documents/ 里的名字，点开就在页面里读）
 */
export type CardExtra = {
  /** 图床上的文件名，例如 "plan-fig3.webp"；本地图则是 "images/xxx.webp"。 */
  src?: string;
  /** 正文的名字（profile/documents/<name>.ts）。 */
  doc?: string;
};

export type PaperEntry = {
  id: string;
  /** 邮戳上的短标，也是详情页的标题。 */
  label: { zh: string; en: string };
  /** 收录载体。 */
  place: { zh: string; en: string };
  /** 摘要：手写体写在背面，最多七行。 */
  message: { zh: string; en: string };
  date?: string;
  color: string;
  /** 明信片正面的那张图：图床上的文件名，或站点自己的 images/ 路径。 */
  src?: string;
  /** 全文的链接（public/ 里的文件，或别处的地址）。 */
  href?: { zh: string; en: string };
  /** 论文的正文（profile/documents/<name>.ts），点开就在页面里读。 */
  doc?: string;
};

/*
 * 下面是校验：generated.ts 的形状必须对得上上面的类型。
 * 形状不对时，tsc 会在这一行报错 —— 比等到页面渲染出问题更早。
 */

/** 名字、城市、账号（来自 site.yaml）。 */
export const IDENTITY: {
  name: string;
  nameLocal: string;
  handle: string;
  location: string;
  locationEn: string;
  timezone: string;
} = GEN_IDENTITY;

/** 八门课、每门四张作业卡（来自 courses/）。 */
export const COURSES: readonly (CourseEntry & { extra?: readonly (CardExtra | undefined)[] })[] = GEN_COURSES;

/** 论文（来自 papers/）。 */
export const PAPERS: readonly PaperEntry[] = GEN_PAPERS;
