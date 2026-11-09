import type { Profile } from "../src/profile/schema";
import { bed } from "../src/profile/bed";
import { COURSES, IDENTITY, PAPERS } from "./content";
import { seal } from "./seal";

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * duskfolio —— 这一份资料就是你的博客。改这一个文件就能换掉整站的内容。
 *
 * 【要改的地方，按重要性排】
 *   1. name / nameLocal / bio / role / location —— 你的名字和专业
 *      改完名字后运行： bun run seal 你的名字
 *      它会用小篆重新刻一方名章写进 profile/seal.ts（需要联网取字形）。
 *   2. links —— 你的邮箱、GitHub、任何你想留的链接
 *   3. source —— 你自己 fork 后的仓库地址（AGPL-3.0 要求公开源码，页脚会链过去）
 *   4. profile/content.ts —— 课程作业册与论文册的全部内容（八门课 × 四张作业，十二篇论文）
 *      中英两版共用这一份骨架，所以改一处两边同时变。
 *   5. items —— 文件夹里的五样东西：名帖 / 学术履历 / 选题票 / 照片 / 便笺
 *
 * 【三本册子对应什么】
 *   课程作业册（cards，每面 2×4）   →  albums.cards     —— 一门课四张，label 写课程号
 *   论文册（postcards，每张 2×3）   →  albums.postcards —— 一篇论文一张，message 是摘要
 *   学术履历（resume）              →  items 里的 resume —— 学业、竞赛、项目、技能
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** 三十二张作业卡：每门课连着四张，颜色由浅到深。图与正文由 extra 带进来。 */
const assignmentCards = COURSES.flatMap((c, ci) =>
  c.zh.cards.map((card, i) => ({
    id: `a${String(ci * 4 + i + 1).padStart(2, "0")}`,
    label: c.code,
    nameLocal: card.name,
    color: c.colors[i]!,
    note: `${c.zh.course}：${card.note}`,
    ...(c.extra?.[i]?.src ? { src: bed(c.extra[i]!.src!) } : {}),
    ...(c.extra?.[i]?.doc ? { doc: c.extra[i]!.doc } : {}),
  })),
);

/** 十二张论文卡：一张明信片一篇论文。message 是摘要，place 是收录载体。 */
const paperPostcards = PAPERS.map((p) => ({
  id: p.id,
  label: p.label.zh,
  place: p.place.zh,
  message: p.message.zh,
  from: IDENTITY.nameLocal,
  ...(p.date ? { date: p.date } : {}),
  color: p.color,
  ...(p.src ? { src: bed(p.src) } : {}),
  ...(p.href ? { href: p.href.zh } : {}),
  ...(p.doc ? { doc: p.doc } : {}),
}));

export const profileZh: Profile = {
  lang: "zh-CN",
  // 中文版：名字本身就是竖排的名牌（没有另一个「本地名」要重复印一遍），
  // 拉丁名 Molly 只在英文版里用。
  name: IDENTITY.nameLocal,
  nameLocal: undefined,
  handle: IDENTITY.handle,
  role: "网络与新媒体 · 智能传播方向",
  location: IDENTITY.location,
  timezone: IDENTITY.timezone,
  bio: "网络与新媒体专业大二学生，方向是智能传播。这个页面上放着我的课程作业和论文：左边一册是每门课的作业，右边一册是写过的论文，文件夹里是一份履历。",
  coverTitle: `${IDENTITY.nameLocal} · 课程作业与论文`,
  seal,
  // ⚠️ 换成你自己 fork 后的仓库地址（AGPL-3.0 要求公开源码，页脚会链过去）
  source: "https://github.com/hualala25/duskfolio",
  links: [
    // ⚠️ 换成你自己的邮箱和主页
    { label: "邮箱", href: "mailto:hualala25@users.noreply.github.com" },
    { label: "GitHub", href: "https://github.com/hualala25" },
  ],
  items: [
    {
      kind: "card",
      id: "card",
      label: "名帖",
      anecdote: "一张对折的棉浆纸名片，正面只有名字、方向，和一个小圆点。",
      story: "名片是给自己印的，印完发现比作业还花时间。里面留给真正会回信的人。",
      specs: [
        { k: "纸张", v: "600 克棉浆纸" },
        { k: "印刷", v: "活版，单色" },
        { k: "尺寸", v: "91 × 55 毫米，对折" },
      ],
      front: { name: IDENTITY.nameLocal, role: "网络与新媒体 · 智能传播方向", tagline: "把想说的话写清楚" },
      inside: [
        { k: "邮箱", v: "hualala25@users.noreply.github.com" },
        { k: "主页", v: "duskfolio（这个页面）" },
        { k: "所在", v: `${IDENTITY.location} · UTC+8` },
        { k: "语言", v: "中文 · English" },
      ],
      insideNote: "课程作业和论文都收在这个页面上，欢迎来信。",
    },
    {
      kind: "resume",
      id: "resume",
      label: "学术履历",
      anecdote: "两页：一页写学业与竞赛，一页写项目、工具和技能。",
      story: "写这份履历的时候才发现自己一年里做了不少事，但都散在文件夹里。整理出来，才算有了形状。",
      specs: [
        { k: "页数", v: "2" },
        { k: "更新", v: "2026 年 11 月" },
        { k: "语言", v: "中文 · 英文" },
      ],
      summary: "网络与新媒体专业大二学生，方向智能传播。关心媒介内容怎么被生产、怎么被算法接住，以及读者在其中还剩下多少主动性。",
      // ⚠️ 下面三段经历的具体内容（融媒体中心实习、1.2 万阅读、竞赛入围）是我按你的情况编的，
      //    换成你真实做过的事：改了这里，页面上印的就是真的了。
      experience: [
        {
          org: "公益广告大赛",
          role: "二等奖",
          from: "2026",
          to: "2026",
          bullets: ["占位：把你的参赛作品、赛事全名和获奖情况写在这里。"],
        },
        // 还有第二、第三段经历时，照上面的形状加在后面就行（org / role / from / to / bullets）
      ],
      education: [{ school: "西北大学", degree: "网络与新媒体 学士（在读）", from: "2024", to: "至今" }],
      // ⚠️ 技能与语言这两行也是我按你的情况填的示例 —— 换成你真会的
      skills: ["新闻采写", "深度报道策划", "短视频脚本", "数据新闻可视化", "播客脚本", "Figma", "Python（基础）", "Premiere"],
      languages: ["中文（母语）", "英语"]
    },
    {
      kind: "ticket",
      id: "ticket",
      label: "选题票",
      anecdote: "一张选题票：赛事、题目、赛区、截止时间，都印在一张 150 毫米的卡纸上。",
      story: "这是第九届数字编辑创新大赛的选题凭证。改过七版题目，最后留下的是最笨的那一个：把长征九十周年，交给一个具体的人来走。",
      specs: [
        { k: "赛事", v: "第九届数字编辑创新大赛" },
        { k: "赛区", v: "陕西分赛区" },
        { k: "形式", v: "交互式叙事专题" },
      ],
      event: "数字编辑创新大赛",
      talk: "长征胜利九十周年：一条可交互的叙事路径",
      date: "2026-09-20",
      time: "23:59",
      venue: "陕西赛区",
      city: IDENTITY.location,
      seat: "入围",
      serial: "No. 0186",
      links: [{ label: "作品", href: "#cards" }],
    },
    {
      kind: "polaroid",
      id: "polaroid",
      label: "照片",
      anecdote: "图书馆四楼靠窗的位置，19:40，天快黑了。",
      story: "那天在改学年论文的第八页，改到一半抬头，窗外的天正好是这个颜色。就用这个当拍立得的第一张。",
      caption: "图书馆，19:40",
      tint: "#d9c0c6",
      place: "图书馆",
      date: "2026-10-28",
      back: "论文改到第八页。窗外的天是这个颜色，才想起来记下来。",
    },
    {
      kind: "note",
      id: "note",
      label: "便笺",
      anecdote: "一筆箋是一种窄长的信纸，只写几行：比一封信短，比一条消息多一点心意。",
      story: "这张便笺放在文件夹的最后，写给第一个把它抽出来的人。",
      text: "欢迎来翻这个本子。左边那册是课程作业，右边那册是论文，中间文件夹里是我的履历。哪一页看不明白，写信问我。",
      from: IDENTITY.nameLocal,
      date: "2026-11-08",
    },
  ],
  albums: {
    cards: assignmentCards,
    postcards: paperPostcards,
  },
};
