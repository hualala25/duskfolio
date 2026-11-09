/**
 * docx → the site's document body.
 *
 * A .docx is a zip of XML. This reads it without a dependency (node:zlib does the inflate) and writes
 * a `Document` — the blocks a paper or an assignment is made of — into `profile/documents/<name>.ts`.
 *
 *   bun run docx <file.docx> <name> [--images <dir>] [--bed <prefix>]
 *
 * The name is the document's own name: `bun run docx ~/Desktop/…/AI眼镜社交边界.docx ai-glasses` writes
 * `profile/documents/ai-glasses.ts`.
 *
 * With `--images <dir>`, the pictures inside the document are written into that folder as PNGs and the
 * blocks refer to them (`images/figure-1.png`). Without it, a picture block carries no file and the
 * page draws its place instead.
 *
 * With `--bed <prefix>`, the pictures are not written at all: the blocks name them `<prefix>1.webp`,
 * `<prefix>2.webp`… and the site loads them from the image bed (src/profile/bed.ts). Use it when the
 * pictures are already on the bed — the figures of a paper usually are.
 *
 * What it reads: the paragraphs (with their heading level), the tables (as rows of cells) and the
 * pictures. It does not read footnotes, comments or the numbering's own counters.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import zlib from "node:zlib";

/* ── the zip ────────────────────────────────────────────────────────────────────────────────────────────────── */

type ZipEntry = { name: string; data: Buffer };

/** Every file in a zip, by name. Reads the local file headers (a docx has no zip64 and no encryption). */
function unzip(buf: Buffer): Map<string, Buffer> {
  const out = new Map<string, Buffer>();
  let off = 0;
  while (off + 4 <= buf.length) {
    if (buf.readUInt32LE(off) !== 0x04034b50) {
      off++;
      continue;
    }
    const method = buf.readUInt16LE(off + 8);
    const csize = buf.readUInt32LE(off + 18);
    const nlen = buf.readUInt16LE(off + 26);
    const elen = buf.readUInt16LE(off + 28);
    const name = buf.slice(off + 30, off + 30 + nlen).toString("utf8");
    const start = off + 30 + nlen + elen;
    const raw = buf.slice(start, start + csize);
    if (!name.endsWith("/")) out.set(name, method === 8 ? zlib.inflateRawSync(raw) : Buffer.from(raw));
    off = start + csize;
  }
  return out;
}

/* ── the xml ────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Every `<w:p>` in document order, with its text, its heading level and the pictures it holds. */
type RawPara = { text: string; level: number; bold: boolean; images: string[]; inTable: boolean; cells: string[][]; toc: boolean };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** The text of one element: its `<w:t>` runs, with the entities decoded. */
function textOf(xml: string): string {
  let out = "";
  const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\s*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    if (m[1] === undefined) {
      out += "\t";
      continue;
    }
    out += m[1].replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (e, g: string) => {
      if (g[0] === "#") return String.fromCodePoint(g[1] === "x" || g[1] === "X" ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10));
      return ENTITIES[g] ?? e;
    });
  }
  return out;
}

/** The heading level of a paragraph: its style's name says so (heading 1 → 1). 0 is body text. */
function levelOf(style: string): number {
  const m = /(?:heading|标题|標題)\s*([1-9])/i.exec(style);
  if (m) return Number(m[1]);
  if (/^(Title|标题|標題)$/i.test(style)) return 1;
  return 0;
}

/**
 * The style names, by id. A .docx's paragraphs carry a style *id* (`w:pStyle w:val="3"`), and only styles.xml
 * says what that means (`3` → "heading 1"). A document written by a Chinese word processor has ids like "33";
 * without this map every heading would read as body text.
 */
function styleNames(xml: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /<w:style\s[^>]*w:styleId="([^"]+)"[^>]*>([\s\S]*?)<\/w:style>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const nm = /<w:name\s+w:val="([^"]*)"/.exec(m[2]!);
    if (nm) out.set(m[1]!, nm[1]!);
  }
  return out;
}

/** A style that is not body text: the table of contents' own levels are skipped (they are a list, not the text). */
function isToc(name: string): boolean {
  return /^(toc\s*\d|TOCHeading)/i.test(name);
}

/**
 * The heading level of a paragraph that carries no heading style.
 *
 * A Chinese academic paper often writes its whole structure in the text and leaves the style at "正文":
 * 一、 for the chapters, （一） for the sections under them, and a few words alone on a line for the
 * front and the back matter. Without this, a paper's chapters would all read as one long paragraph.
 */
function guessLevel(text: string): number {
  if (!text || text.length > 40) return 0;
  // 一、二、…（the chapters）
  if (/^[一二三四五六七八九十]+[、．.]\s*/.test(text)) return 1;
  // （一）（二）…（the sections under a chapter）
  if (/^[(（][一二三四五六七八九十]+[)）]/.test(text)) return 2;
  // 1. 2. …（the same, in digits）
  if (/^\d{1,2}[.、]\s*\S/.test(text) && !/\d{4}\s*年/.test(text)) return 1;
  // the words that stand alone
  if (/^(引言|绪论|摘要|关键词|结论|结语|参考文献|致谢|附录|后记|前言)$/.test(text)) return 1;
  return 0;
}

/** One thing in the body, in the order the document has it. */
type BodyItem = { type: "para"; para: RawPara } | { type: "table"; rows: string[][] };

/** Split the document body into paragraphs, tables and pictures, in the order the document has them. */
function parseDocument(xml: string, rels: Map<string, string>, styles: Map<string, string>): BodyItem[] {
  const items: BodyItem[] = [];

  // walk the body: a <w:tbl> is a table, a <w:p> a paragraph. Nested tables are rare here; a paragraph inside a
  // table cell is picked up by the table branch instead.
  const bodyMatch = /<w:body>([\s\S]*)<\/w:body>/.exec(xml);
  const body = bodyMatch ? bodyMatch[1]! : xml;

  const takePara = (p: string, inTable: boolean, cells: string[][]): RawPara => {
    const styleMatch = /<w:pStyle\s+w:val="([^"]*)"/.exec(p);
    const styleId = styleMatch ? styleMatch[1]! : "";
    const style = styles.get(styleId) ?? styleId;
    const images: string[] = [];
    const blipRe = /<a:blip[^>]*r:embed="([^"]+)"/g;
    let b: RegExpExecArray | null;
    while ((b = blipRe.exec(p))) {
      const target = rels.get(b[1]!);
      if (target) images.push(target);
    }
    const bold = /<w:b(?:\s[^>]*)?\/?>/.test(p);
    return { text: textOf(p).trim(), level: levelOf(style), bold, images, inTable, cells, toc: isToc(style) };
  };

  // a table: its rows, each row's cells, each cell's paragraphs as one string
  const readTable = (tbl: string): string[][] => {
    const rows: string[][] = [];
    const rowRe = /<w:tr(?:\s[^>]*)?>([\s\S]*?)<\/w:tr>/g;
    let rm: RegExpExecArray | null;
    while ((rm = rowRe.exec(tbl))) {
      const row = rm[1]!;
      const cells: string[] = [];
      const cellRe = /<w:tc>([\s\S]*?)<\/w:tc>/g;
      let cm: RegExpExecArray | null;
      while ((cm = cellRe.exec(row))) {
        const cell = cm[1]!;
        const cellParas: string[] = [];
        const cpRe = /<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g;
        let cpm: RegExpExecArray | null;
        while ((cpm = cpRe.exec(cell))) {
          const t = textOf(cpm[1]!).trim();
          if (t) cellParas.push(t);
        }
        cells.push(cellParas.join(" "));
      }
      if (cells.length) rows.push(cells);
    }
    return rows;
  };

  // the body in document order: a paragraph or a table, whichever comes next
  const itemRe = /<w:tbl>([\s\S]*?)<\/w:tbl>|<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g;
  let im: RegExpExecArray | null;
  while ((im = itemRe.exec(body))) {
    if (im[1] !== undefined) {
      const rows = readTable(im[1]);
      if (rows.length) items.push({ type: "table", rows });
      continue;
    }
    const p = takePara(im[2]!, false, []);
    if (p.toc) continue;
    if (p.text || p.images.length) items.push({ type: "para", para: p });
  }

  return items;
}

/* ── the document model ────────────────────────────────────────────────────────────────────────────────── */

export type DocBlock =
  | { kind: "h"; level: number; text: string }
  | { kind: "subtitle"; text: string }
  | { kind: "p"; text: string }
  | { kind: "figure"; src?: string; caption?: string }
  | { kind: "table"; caption?: string; rows: string[][] };

export type Document = { title: string; blocks: DocBlock[] };

/* ── the command ────────────────────────────────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith("--"));
const imagesDir = args.includes("--images") ? args[args.indexOf("--images") + 1] : undefined;
const bedPrefix = args.includes("--bed") ? args[args.indexOf("--bed") + 1] : undefined;
if (files.length < 2) {
  console.error("usage: bun run docx <file.docx> <name> [--images <dir>]");
  process.exit(1);
}
const file = resolve(files[0]!);
const name = files[1]!;

const zip = unzip(readFileSync(file));
const docXml = zip.get("word/document.xml")?.toString("utf8") ?? "";
if (!docXml) {
  console.error(`not a .docx (no word/document.xml): ${file}`);
  process.exit(1);
}

/** rId → the file it points at (word/media/…) */
const rels = new Map<string, string>();
const relXml = zip.get("word/_rels/document.xml.rels")?.toString("utf8") ?? "";
const relRe = /<Relationship\s[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g;
let rm: RegExpExecArray | null;
while ((rm = relRe.exec(relXml))) rels.set(rm[1]!, rm[2]!.replace(/^\.\.\//, ""));

const styles = styleNames(zip.get("word/styles.xml")?.toString("utf8") ?? "");
const items = parseDocument(docXml, rels, styles);

/* the pictures, in the order they appear */
const pictureFiles: string[] = [];
const pictureOf = (target: string): string => {
  const key = `word/${target.replace(/^\//, "")}`;
  const buf = zip.get(key);
  if (!buf) return "";
  if (!pictureFiles.includes(target)) pictureFiles.push(target);
  return target;
};

/* the title: the first paragraph that is a title or a heading 1 */
let title = "";
const titleAt = items.findIndex((it) => it.type === "para" && (it.para.level === 1 || (it.para.level === 0 && it.para.bold && it.para.text.length < 60)));
if (titleAt >= 0) {
  title = (items[titleAt] as { type: "para"; para: RawPara }).para.text;
  items.splice(titleAt, 1);
}

/* the blocks, in the document's order */
const blocks: DocBlock[] = [];
for (const item of items) {
  if (item.type === "table") {
    blocks.push({ kind: "table", rows: item.rows });
    continue;
  }
  const p = item.para;
  // a picture on its own paragraph → a figure block; the caption is the next short paragraph
  if (p.images.length && !p.text) {
    const src = pictureOf(p.images[0]!);
    blocks.push({ kind: "figure", ...(src ? { src } : {}) });
    continue;
  }
  // a paragraph that is only a figure's caption ("图1 …")
  const capM = /^(图|Figure|Fig\.)\s*[\d一二三四五六七八九十]+[：:、\s]*(.*)$/.exec(p.text);
  const last = blocks[blocks.length - 1];
  if (capM && last && last.kind === "figure") {
    blocks[blocks.length - 1] = { ...last, caption: p.text };
    continue;
  }
  // the heading level: the style's, or the paragraph's own shape (a Chinese paper writes it in the text)
  const level = p.level || guessLevel(p.text);
  if (level > 0) blocks.push({ kind: "h", level, text: p.text });
  // the line right under the title, set with a dash on both ends, is the document's own tagline
  else if (p.text.startsWith("——") && blocks.length === 0) {
    blocks.push({ kind: "subtitle", text: p.text.replace(/^——\s*/, "") });
  }
  else if (p.text) blocks.push({ kind: "p", text: p.text });
}

/* the pictures: written out (into public/), or named on the image bed */
let written = 0;
if (imagesDir) {
  mkdirSync(imagesDir, { recursive: true });
  for (const target of pictureFiles) {
    const buf = zip.get(`word/${target.replace(/^\//, "")}`);
    if (!buf) continue;
    const out = join(imagesDir, basename(target));
    writeFileSync(out, buf);
    written++;
  }
  // the blocks' src → the site's path
  for (const b of blocks) {
    if (b.kind === "figure" && b.src) b.src = `images/${basename(b.src)}`;
  }
} else if (bedPrefix) {
  // the blocks' src → the bed's file name, in the order the pictures appear
  let n = 0;
  for (const b of blocks) {
    if (b.kind === "figure" && b.src) {
      n++;
      b.src = `${bedPrefix}${n}.webp`;
    }
  }
}

const doc: Document = { title, blocks };
const outDir = join(import.meta.dir, "..", "profile", "documents");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `${name}.ts`);
writeFileSync(
  outFile,
  `/* Generated by scripts/docx.ts from ${basename(file)} — do not edit by hand; re-run the command instead. */\n\nimport type { Document } from "../../src/profile/document";\n\nexport const document: Document = ${JSON.stringify(doc, null, 2)};\n`,
  "utf8",
);

console.log(`${basename(file)} → profile/documents/${name}.ts`);
console.log(`  title: ${title}`);
console.log(`  blocks: ${blocks.length}（${blocks.filter((b) => b.kind === "h").length} 标题 / ${blocks.filter((b) => b.kind === "p").length} 段 / ${blocks.filter((b) => b.kind === "figure").length} 图 / ${blocks.filter((b) => b.kind === "table").length} 表）`);
if (imagesDir) console.log(`  pictures: ${written} → ${imagesDir}`);
if (bedPrefix) console.log(`  pictures: on the image bed as ${bedPrefix}1.webp …`);
if (!title) console.log("  (no title found — set one by hand)");
