import { describe, expect, test } from "bun:test";
import { profile as sample } from "../../profile/en";
import { profileZh as sampleZh } from "../../profile/zh";
import { COURSES, PAPERS } from "../../profile/content";

/*
 * duskfolio —— the content's own rules.
 *
 * The albums are not a pile of samples any more: they are a course archive and a paper
 * archive. So these tests check the things that must stay true for the archive to read
 * as an archive — four cards per course in a light-to-dark ramp, one postcard per paper,
 * a Chinese and an English edition that describe exactly the same things.
 */

/** A course's four card colours must read as one ramp: light to dark, and never the same twice. */
const luma = (hex: string) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!);
};

describe("the course assignment album", () => {
  const cards = sample.albums.cards;

  test("four full sides of eight", () => {
    expect(cards.length).toBe(32);
  });

  test("ids are unique; a course code is shared by its four cards", () => {
    expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length);
    for (const c of cards) {
      expect(c.id).toMatch(/^a\d{2}$/);
      expect(c.label).toMatch(/^[A-Z]{3}\d{3}$/); // a course code, e.g. NME101
      expect(c.color).toMatch(/^#[0-9a-f]{6}$/);
      expect(c.nameLocal!.trim().length).toBeGreaterThan(1);
    }
    // the same code on four cards, four different names
    const byCode = new Map<string, typeof cards>();
    for (const c of cards) byCode.set(c.label, [...(byCode.get(c.label) ?? []), c]);
    for (const [code, group] of byCode) {
      expect(group.length).toBe(4);
      expect(new Set(group.map((c) => c.nameLocal)).size).toBe(4);
      expect(new Set(group.map((c) => c.id)).size).toBe(4);
      expect(code).toMatch(/^[A-Z]{3}\d{3}$/);
    }
    // the Chinese edition names each card in Han (digits allowed: 作业1), the English one in Latin
    for (const c of sampleZh.albums.cards) expect(c.nameLocal).toMatch(/^[一-鿿0-9]+$/);
    for (const c of cards) expect(c.nameLocal).not.toMatch(/[一-鿿]/);
  });

  test("every colour is used once", () => {
    expect(new Set(cards.map((c) => c.color)).size).toBe(cards.length);
  });

  test("eight courses, four cards each, in one light-to-dark ramp", () => {
    expect(COURSES.length).toBe(8);
    for (const c of COURSES) {
      expect(c.colors.length).toBe(4);
      expect(new Set(c.colors).size).toBe(4);
      const ls = c.colors.map(luma);
      for (let i = 1; i < ls.length; i++) expect(ls[i]!).toBeLessThan(ls[i - 1]!);
      // the course's four cards sit together, in that order
      const at = c.colors.map((col) => cards.findIndex((k) => k.color === col));
      expect(at.every((i) => i >= 0)).toBe(true);
      expect(at[1]! - at[0]!).toBe(1);
      expect(at[3]! - at[0]!).toBe(3);
      // and they all carry the course's code
      expect(new Set(at.map((i) => cards[i]!.label)).size).toBe(1);
    }
  });

  test("every card carries a note, in the language of its edition", () => {
    for (const c of cards) expect(c.note!.trim().length).toBeGreaterThan(10);
    for (const c of sampleZh.albums.cards) {
      expect(c.note).toMatch(/[一-鿿]/);
      expect(c.note!.endsWith("。")).toBe(true);
    }
    for (const c of cards) {
      expect(c.note).not.toMatch(/[一-鿿]/);
      expect(c.note!.endsWith(".")).toBe(true);
    }
  });

  test("the Chinese album is the same album, in Chinese", () => {
    const zh = sampleZh.albums.cards;
    expect(zh.map(({ id, label, color }) => ({ id, label, color }))).toEqual(cards.map(({ id, label, color }) => ({ id, label, color })));
    // same order, and each card says something different in each language
    expect(zh.map((c) => c.nameLocal)).not.toEqual(cards.map((c) => c.nameLocal));
    expect(zh.map((c) => c.note)).not.toEqual(cards.map((c) => c.note));
  });
});

/** The postcard's message area: 65.4 mm wide, 5.6 mm type, seven lines of 10 mm. */
const lines = (text: string) => {
  const W = 65.4, SIZE = 5.6;
  const em = [...text].reduce((w, ch) => w + SIZE * (/[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? 1 : 0.52), 0);
  return Math.ceil(em / W);
};

describe("the paper album", () => {
  const cards = sample.albums.postcards;

  test("one sheet of six, twice", () => {
    expect(cards.length).toBe(12);
    expect(PAPERS.length).toBe(12);
  });

  test("every paper carries a place, an author and an abstract long enough to print", () => {
    expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length);
    for (const c of cards) {
      expect(c.id).toMatch(/^p\d{2}$/);
      expect(c.place!.trim().length).toBeGreaterThan(3);
      expect(c.from!.trim().length).toBeGreaterThan(0);
      expect(c.color).toMatch(/^#[0-9a-f]{6}$/);
      // the message is set by hand on the back of a 148 × 105 card: seven lines of 10 mm,
      // 5.6 mm type, 65.4 mm wide — an abstract that needs more lines is silently cut
      expect(lines(c.message)).toBeLessThanOrEqual(7);
    }
    // a date, when there is one, is a real one
    for (const c of cards) if (c.date) expect(c.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("the first paper is a real one, with its full text", () => {
    const first = cards[0]!;
    expect(first.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(first.href).toMatch(/^papers\//);
    expect(first.href).toMatch(/\.docx$/);
  });

  test("the Chinese album is the same album, in Chinese", () => {
    const zh = sampleZh.albums.postcards;
    expect(zh.map(({ id, color, date }) => ({ id, color, date }))).toEqual(cards.map(({ id, color, date }) => ({ id, color, date })));
    expect(zh.map((c) => c.message)).not.toEqual(cards.map((c) => c.message));
    for (const c of zh) {
      expect(c.message).toMatch(/[一-鿿]/);
      expect(c.place).toMatch(/[一-鿿]/);
    }
  });
});

describe("the folio", () => {
  test("five things in the pouch, one of each kind", () => {
    expect(sample.items.length).toBe(5);
    expect(sample.items.map((i) => i.id)).toEqual(["card", "resume", "ticket", "polaroid", "note"]);
    expect(new Set(sample.items.map((i) => i.kind)).size).toBe(5);
  });

  test("the two editions describe the same things", () => {
    expect(sampleZh.items.map((i) => i.id)).toEqual(sample.items.map((i) => i.id));
    expect(sampleZh.items.map((i) => i.kind)).toEqual(sample.items.map((i) => i.kind));
  });

  test("every thing carries an anecdote and a story", () => {
    for (const i of sample.items) {
      expect(i.anecdote!.trim().length).toBeGreaterThan(10);
      expect(i.story!.trim().length).toBeGreaterThan(20);
    }
  });
});

describe("the site's spec rows", () => {
  test("languages are spelled out", () => {
    const rows = JSON.stringify(sample);
    expect(rows).toContain("English · 中文");
    expect(rows).not.toContain("EN · 中文");
  });
});
