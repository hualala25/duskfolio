/*
 * A document: the body of a paper or an assignment, as blocks. It is what the detail view reads when you
 * open one — the same words as the .docx, set on the page instead of behind a download link.
 *
 * The blocks come from `bun run docx <file.docx> <name>`, which writes profile/documents/<name>.ts.
 */

export type DocBlock =
  /** A heading: level 1 is the chapter, 2 the section under it, 3 the one under that. */
  | { kind: "h"; level: number; text: string }
  /** The line under the title (a document's own subtitle, its tagline). */
  | { kind: "subtitle"; text: string }
  /** A paragraph of body text. */
  | { kind: "p"; text: string }
  /** A picture, with its caption ("图3 …"). `src` is a path in `public/` or an address on the image bed. */
  | { kind: "figure"; src?: string; caption?: string }
  /** A table: the first row is its head. */
  | { kind: "table"; caption?: string; rows: string[][] };

export type Document = {
  /** The document's own title (the first heading). */
  title: string;
  blocks: DocBlock[];
};

/** The document's paragraphs that are not headings — the text a reader wants first (the abstract, usually). */
export function lede(doc: Document, max = 2): string[] {
  const out: string[] = [];
  for (const b of doc.blocks) {
    if (b.kind === "p") out.push(b.text);
    if (out.length >= max) break;
  }
  return out;
}
