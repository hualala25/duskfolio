/**
 * Markdown → 站点的文档正文
 *
 * 论文和作业点开读的那一整篇，现在可以直接在文件夹里写 Markdown：
 *
 *   papers/p13-我的论文/
 *     paper.yaml      卡片信息（标题、摘要、颜色）
 *     正文.md          点开读的全文
 *
 *   bun run sync 会自动把 正文.md 转成 profile/documents/<名字>.ts
 *
 * 支持：标题（# ~ #####）、段落、图片、表格、引用（当副标题）、列表（当段落）。
 * 不支持的：行内样式（**粗体** 会去掉星号留下字）、脚注、HTML。
 * 这是刻意的 —— 页面上的正文是一篇论文的排版，不是网页编辑器。
 */
import { readFileSync } from "node:fs";
import type { DocBlock, Document } from "../src/profile/document";

/** 去掉行内标记，留下字。`**粗**` → `粗`，`*斜*` → `斜`，`` `码` `` → `码`，`[字](url)` → `字`。 */
function plain(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2")
    .replace(/~~([^~]+)~~/g, "$1")
    .trim();
}

/** 一个表格块：| a | b | 加一条 |---|---| 分隔线。 */
function parseTable(lines: string[]): string[][] {
  const rows: string[][] = [];
  for (const line of lines) {
    // 分隔行（|---|---|）跳过
    if (/^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-")) continue;
    const cells = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => plain(c));
    if (cells.some((c) => c)) rows.push(cells);
  }
  return rows;
}

export function markdownToDocument(md: string, fallbackTitle = ""): Document {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const blocks: DocBlock[] = [];
  let title = "";
  let para: string[] = [];
  let i = 0;

  const flushPara = () => {
    const text = para.join(" ").trim();
    para = [];
    if (text) blocks.push({ kind: "p", text: plain(text) });
  };

  while (i < lines.length) {
    const line = lines[i]!;

    // 空行：段落结束
    if (!line.trim()) {
      flushPara();
      i++;
      continue;
    }

    // 分隔线：忽略
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      flushPara();
      i++;
      continue;
    }

    // 标题
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      const level = Math.min(h[1]!.length, 3);
      const text = plain(h[2]!);
      // 第一个一级标题当整篇的标题，不重复排
      if (level === 1 && !title) title = text;
      else if (text) blocks.push({ kind: "h", level, text });
      i++;
      continue;
    }

    // 表格
    if (/^\s*\|/.test(line)) {
      flushPara();
      const chunk: string[] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i]!)) chunk.push(lines[i++]!);
      const rows = parseTable(chunk);
      if (rows.length) blocks.push({ kind: "table", rows });
      continue;
    }

    // 图片：单独一行的 ![说明](路径)
    const img = /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(line);
    if (img) {
      flushPara();
      const alt = img[1]!.trim();
      const src = img[2]!.trim();
      // 图床文件名（没有斜杠和协议）交给站点拼地址；其余原样
      const isBedName = !/[/\\]/.test(src) && !/^(https?:|data:)/.test(src);
      blocks.push({
        kind: "figure",
        src: isBedName ? src : src.replace(/^\.?\//, ""),
        ...(alt ? { caption: alt } : {}),
      });
      i++;
      continue;
    }

    // 引用：当副标题（文档开头那一句）或普通段落
    const q = /^\s*>\s?(.*)$/.exec(line);
    if (q) {
      flushPara();
      const text = plain(q[1]!);
      // 标题之后、正文之前的第一个块 = 副标题（一篇论文常有一句题记）
      if (text) blocks.push(blocks.length === 0 ? { kind: "subtitle", text } : { kind: "p", text });
      i++;
      continue;
    }

    // 列表：每一项单独一段（论文里少见，够用）
    const li = /^\s*(?:[-*+]|\d+\.)\s+(.*)$/.exec(line);
    if (li) {
      flushPara();
      const text = plain(li[1]!);
      if (text) blocks.push({ kind: "p", text });
      i++;
      continue;
    }

    // 其余：段落的一行
    para.push(line.trim());
    i++;
  }
  flushPara();

  return { title: title || fallbackTitle, blocks };
}

/** 从文件读并转换（sync 用）。 */
export function readMarkdown(path: string, fallbackTitle = ""): Document {
  return markdownToDocument(readFileSync(path, "utf8"), fallbackTitle);
}
