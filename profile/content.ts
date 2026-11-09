/*
 * duskfolio —— 中英共用的骨架。
 *
 * 这里是「形状」：课程号、卡片 id、颜色、论文 id、日期。中英两版从这里各自取字，
 * 所以两版的形状必然一致（shapeDiff 永远是空的），改一处两边同时变。
 *
 * ── 现在的状态 ────────────────────────────────────────────────────────────
 *   · 课程作业册（COURSES）：八门课 × 四张卡，全部是**占位**（课程1…课程8 / 作业1…作业4）。
 *     换成你真实上的课与真实交的那几次作业 —— 改这一处，中英同时变。
 *   · 论文册（PAPERS）：第一篇是**真的**（《从"举起手机"到"眨一下眼"：AI眼镜时代日常拍摄的
 *     社交边界消解与重构》，全文在 public/papers/ 里，详情页有「全文」链接）；
 *     其余十一篇是**占位**（论文2…论文12）。
 *
 * ── 三条硬约束（超了 bun test src 会直接告诉你）────────────────────────────
 *   1. 卡片上的中文作业名 ≤ 6 字、英文 ≤ 20 字符（卡面 85.6 mm 宽、4 mm 字）
 *   2. 论文摘要：中文 ≤ 82 字、英文 ≤ 157 字符（明信片背面 65.4 mm 宽、5.6 mm 字、七行）
 *   3. 履历里的组织名：英文 ≤ 24 字符、中文 ≤ 12 全角（A4 内容列 123.9 mm，扣掉年份栏）
 */

export type AssignmentText = { name: string; note: string };

export type CourseEntry = {
  /** 印在卡片上的课程号（拉丁字母，窄，比汉字好排）。 */
  code: string;
  /** 这门课四个作业卡的颜色，由浅到深。 */
  colors: readonly [string, string, string, string];
  zh: { course: string; cards: readonly AssignmentText[] };
  en: { course: string; cards: readonly AssignmentText[] };
};

/**
 * 一门课里的一张作业卡，多出来的东西：
 * - src: 这张卡的图（图床上的文件名，见 src/profile/bed.ts）
 * - doc: 这份作业的正文（profile/documents/ 里的名字，点开就在页面里读）
 */
export type CardExtra = {
  /** 图床上的文件名，例如 "plan-fig3.webp"。 */
  src?: string;
  /** 正文的名字（profile/documents/<name>.ts）。 */
  doc?: string;
};

/**
 * 一门占位课：课程 n，四张作业卡（作业1…作业4），中英各一套。
 * 换成真课时，照着这个形状改一行就行 —— 颜色由浅到深，四个互不相同。
 */
const course = (n: number, colors: readonly [string, string, string, string]): CourseEntry => ({
  code: `CRS${String(n).padStart(3, "0")}`,
  colors,
  zh: {
    course: `课程${n}`,
    cards: [1, 2, 3, 4].map((i) => ({ name: `作业${i}`, note: `占位：课程${n} 的第 ${i} 次作业。换成你真实交的那一次。` })),
  },
  en: {
    course: `Course ${n}`,
    cards: [1, 2, 3, 4].map((i) => ({ name: `Assignment ${i}`, note: `Placeholder: assignment ${i} of course ${n} — replace it with what you actually submitted.` })),
  },
});

/**
 * 一门课：课程号、四张卡的颜色、每张卡的题目与说明。
 * `extra` 给某一张卡补上它的图（���床上的文件名）与正文（profile/documents/ 里的名字）。
 */
export const COURSES: readonly (CourseEntry & { extra?: readonly (CardExtra | undefined)[] })[] = [
  {
    ...course(1, ["#f8e2e6", "#f4d3da", "#efc2cc", "#e7aebc"]),
    zh: {
      course: "人工智能概论",
      cards: [
        { name: "热量镜策划案", note: "“热量镜”智能热量识别与饮食管理产品策划案（课程作业）。" },
        { name: "占位作业二", note: "占位：人工智能概论的第二次作业。换成你真交的那一次。" },
        { name: "占位作业三", note: "占位：人工智能概论的第三次作业。换成你真交的那一次。" },
        { name: "占位作业四", note: "占位：人工智能概论的第四次作业。换成你真交的那一次。" },
      ],
    },
    en: {
      course: "Introduction to Artificial Intelligence",
      cards: [
        { name: "Heat Mirror plan", note: "“Heat Mirror”: a product plan for AI-powered calorie recognition and diet management." },
        { name: "Placeholder 2", note: "Placeholder: the second assignment of this course — replace it with what you submitted." },
        { name: "Placeholder 3", note: "Placeholder: the third assignment of this course — replace it with what you submitted." },
        { name: "Placeholder 4", note: "Placeholder: the fourth assignment of this course — replace it with what you submitted." },
      ],
    },
    // 第一张卡是真的：图是策划案里的架构图，正文在 profile/documents/heat-mirror.ts
    extra: [{ src: "plan-fig3.webp", doc: "heat-mirror" }, undefined, undefined, undefined],
  },
  course(2, ["#f7dde2", "#f2c9d2", "#ebb2bf", "#e19aab"]),
  course(3, ["#eae2f1", "#ded4e9", "#d0bedd", "#bda4d0"]),
  course(4, ["#f9e4e0", "#f5d1ca", "#efc0b6", "#e4ab9f"]),
  course(5, ["#f7ead6", "#efdcc0", "#e6caa6", "#d8b78c"]),
  course(6, ["#f4e7c4", "#e9d5a5", "#ddc08d", "#cca76f"]),
  course(7, ["#f8e9e7", "#f3d9d6", "#ecc8c4", "#e4b6b2"]),
  course(8, ["#f8f4ee", "#f1eae1", "#e8ded4", "#dccfc4"]),
];

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
  /** 明信片正面的那张图：图床上的文件名（见 src/profile/bed.ts）。 */
  src?: string;
  /** 全文的链接（public/ 里的文件，或别处的地址）。 */
  href?: { zh: string; en: string };
  /** 论文的正文（profile/documents/<name>.ts），点开就在页面里读。 */
  doc?: string;
};

/** 一篇占位论文：论文 n。 */
const paper = (n: number, color: string): PaperEntry => ({
  id: `p${String(n).padStart(2, "0")}`,
  label: { zh: `论文${n}`, en: `Paper ${n}` },
  place: { zh: "待填：收录载体", en: "To be filled in: where it was published" },
  message: { zh: `占位：第 ${n} 篇论文的摘要。换成你真写的那一篇。`, en: `Placeholder: the abstract of paper ${n} — replace it with the one you actually wrote.` },
  color,
});

export const PAPERS: readonly PaperEntry[] = [
  {
    id: "p01",
    label: {
      zh: "从「举起手机」到「眨一下眼」：AI眼镜时代日常拍摄的社交边界消解与重构",
      en: "From raising the phone to a blink: AI glasses and the social boundaries of being photographed",
    },
    place: { zh: "西北大学 · 新闻传播学院", en: "Northwest University · School of Journalism" },
    message: {
      zh: "2024年以来，AI眼镜把「举起手机—对准—拍摄」压缩为一次眨眼。拍摄动作不再可见，知情同意与记录权随之松动；场所禁令、平台标识与「提前说一声」正在重建边界。",
      en: "AI glasses turn raising a phone to shoot into one blink. The act is invisible, so consent shifts; new boundaries come from bans, labels and saying so first.",
    },
    date: "2026-10-29",
    color: "#f0d3da",
    // 明信片正面：图床上的那张封面（src/profile/bed.ts）
    src: "paper-ai-glasses.webp",
    href: { zh: "papers/AI眼镜社交边界.docx", en: "papers/AI眼镜社交边界.docx" },
    // 全文在页面里读（profile/documents/ai-glasses.ts）
    doc: "ai-glasses",
  },
  paper(2, "#e8b6c0"),
  paper(3, "#d3c8de"),
  paper(4, "#f0c8c1"),
  paper(5, "#dfaeba"),
  paper(6, "#cd9aab"),
  paper(7, "#efd6d5"),
  paper(8, "#dba9a2"),
  paper(9, "#e2bccb"),
  paper(10, "#c9a2b6"),
  paper(11, "#c0aad2"),
  paper(12, "#e9cbbd"),
];

/* ─────────────────────────────────────────────────────────────────────────────
 * 身份 —— 这一处就是你的名字，全站都从这儿取。
 *
 * 「罗语墨 / Molly」：中文名是 `nameLocal`（印在名牌、藏书票、小篆名章、简历页眉），
 * 拉丁名是 `name`（英文版的名牌）。中文版与英文版的名牌各取一个（见 zh.ts / en.ts）。
 *
 * 名章：`bun run seal 罗语墨` 已经刻好了 —— 「罗」在《说文解字》的篆文里没有字形
 * （晚于篆书），所以那一方章刻的是「语墨之印」（用字），章仍然属于罗语墨这个名字。
 * 想换成别的组合，把名字传给脚本重刻即可；换名字后记得重跑一次。
 * ───────────────────────────────────────────────────────────────────────────── */

/** 相机／封面等全局量（两版共用，保证形状一致）。 */
export const IDENTITY = {
  name: "Molly", //            拉丁名 / 英文名
  nameLocal: "罗语墨", //       汉字名：小篆名章、藏书票、简历页眉
  handle: "@hualala25", //     GitHub 账号
  location: "西安", //          所在城市
  locationEn: "Xi'an", //       同上，英文
  timezone: "Asia/Shanghai", // 时区：西安/北京 UTC+8 就不用改
} as const;
