import { describe, expect, test } from "bun:test";
import { COURSES, PAPERS } from "../../profile/content";
import { documentNames, loadDocument } from "../../profile/documents";
import { document as heatMirror } from "../../profile/documents/heat-mirror";
import { document as aiGlasses } from "../../profile/documents/ai-glasses";

/*
 * The documents: the bodies a paper or an assignment is read from.
 *
 * A document comes from a .docx (bun run docx), so what matters is that the conversion kept the shape:
 * the title, the headings, the paragraphs, the pictures and the tables — and that the site's own
 * content points at the documents that exist.
 */

describe("the documents", () => {
  test("each one has a title and its blocks", () => {
    for (const doc of [heatMirror, aiGlasses]) {
      expect(doc.title.length).toBeGreaterThan(4);
      expect(doc.blocks.length).toBeGreaterThan(20);
    }
  });

  test("the assignment's body keeps its five chapters, its four figures and its five tables", () => {
    const kinds = heatMirror.blocks.map((b) => b.kind);
    expect(kinds.filter((k) => k === "h").length).toBeGreaterThan(20);
    expect(kinds.filter((k) => k === "figure").length).toBe(4);
    expect(kinds.filter((k) => k === "table").length).toBe(5);
    // the tagline under the title is its own block, not a paragraph
    expect(heatMirror.blocks[0]!.kind).toBe("subtitle");
  });

  test("the paper's body keeps its five chapters and its references", () => {
    const heads = aiGlasses.blocks.filter((b) => b.kind === "h").map((b) => b.text);
    expect(heads).toContain("引言");
    expect(heads).toContain("结论");
    expect(heads).toContain("参考文献");
    // （一）（二）… are the sections under a chapter
    expect(heads.filter((h) => h.startsWith("（")).length).toBeGreaterThan(15);
  });

  test("every figure names a picture on the image bed", () => {
    for (const doc of [heatMirror, aiGlasses]) {
      for (const b of doc.blocks) {
        if (b.kind !== "figure") continue;
        // a file name on the bed (no path, no address) or nothing at all
        expect(b.src === undefined || /^[a-z0-9-]+\.webp$/.test(b.src)).toBe(true);
        if (b.src) expect(b.caption && b.caption.length > 0).toBe(true);
      }
    }
  });

  test("every table has a head row and the same number of cells in every row", () => {
    for (const doc of [heatMirror, aiGlasses]) {
      for (const b of doc.blocks) {
        if (b.kind !== "table") continue;
        expect(b.rows.length).toBeGreaterThan(1);
        const cols = b.rows[0]!.length;
        for (const row of b.rows) expect(row.length).toBe(cols);
      }
    }
  });

  test("a document loads by name, and a name that is not there loads nothing", async () => {
    expect((await loadDocument("heat-mirror"))?.title).toBe(heatMirror.title);
    expect((await loadDocument("ai-glasses"))?.title).toBe(aiGlasses.title);
    expect(await loadDocument("no-such-document")).toBeNull();
    expect(await loadDocument(undefined)).toBeNull();
  });

  test("every document the site points at is one that exists", async () => {
    const named = new Set(documentNames());
    // the papers
    for (const p of PAPERS) {
      if (!p.doc) continue;
      expect(named.has(p.doc)).toBe(true);
      expect(await loadDocument(p.doc)).not.toBeNull();
    }
    // the assignments
    for (const c of COURSES) {
      for (const extra of c.extra ?? []) {
        if (!extra?.doc) continue;
        expect(named.has(extra.doc)).toBe(true);
        expect(await loadDocument(extra.doc)).not.toBeNull();
      }
    }
  });
});
