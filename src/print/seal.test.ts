import { describe, expect, test } from "bun:test";
import { seal } from "../../profile/seal";
import { sealArtFor, sealChars, sealRun } from "./seal";

describe("sealChars", () => {
  test("two characters gain 之印", () => {
    expect(sealChars("名字", "Ming Zi")).toEqual(["名", "字", "之", "印"]);
  });
  test("three characters gain 印", () => {
    expect(sealChars("欧阳修", "Ouyang Xiu")).toEqual(["欧", "阳", "修", "印"]);
  });
  test("four are used as they are, longer names keep their first four", () => {
    expect(sealChars("司马相如", "Sima Xiangru")).toEqual(["司", "马", "相", "如"]);
    expect(sealChars("爱新觉罗玄烨", "Aisin Gioro")).toEqual(["爱", "新", "觉", "罗"]);
  });
  test("spaces inside the local name are ignored", () => {
    expect(sealChars(" 名 字 ", "Ming Zi")).toEqual(["名", "字", "之", "印"]);
  });
  test("one character is a single monogram", () => {
    expect(sealChars("林", "Lin")).toEqual(["林"]);
  });
  test("no local name gives the Latin initials as one monogram", () => {
    expect(sealChars(undefined, "Ming Zi")).toEqual(["MZ"]);
    expect(sealChars("", "mary ann smith")).toEqual(["MS"]);
    expect(sealChars(undefined, "Prince")).toEqual(["P"]);
    expect(sealChars(undefined, "  ")).toEqual(["○"]);
  });
  test("a name already in Han characters is its own local name", () => {
    expect(sealChars(undefined, "名字")).toEqual(["名", "字", "之", "印"]);
    expect(sealChars("", "欧阳修")).toEqual(["欧", "阳", "修", "印"]);
  });
  test("characters outside the BMP count as one each", () => {
    expect(sealChars("𠀋文", "X")).toEqual(["𠀋", "文", "之", "印"]);
  });
});

describe("sealRun", () => {
  test("Mincho 600 in the glyphs' own Han face", () => {
    expect(sealRun(["名", "字", "之", "印"])).toEqual({ role: "serif", weight: 600, text: "名字之印", han: "zh-Hans" });
    expect(sealRun(["さ", "く", "ら", "印"]).han).toBe("ja");
    expect(sealRun(["林", "文", "之", "印"], "ja").han).toBe("ja");
  });
});

describe("sealArtFor", () => {
  const art = { name: "名字", glyphs: [{ char: "名", d: "M0 0Z", box: [0, 0, 1, 1] as [number, number, number, number] }] };
  test("the small seal glyphs are used while they were cut from this name", () => {
    expect(sealArtFor(art, "名字", "Ming Zi")).toBe(art);
    expect(sealArtFor(art, undefined, "名字")).toBe(art);
    expect(sealArtFor(art, " 名 字 ", "Ming Zi")).toBe(art);
  });
  test("another name, no local name, or no glyphs: typeset", () => {
    expect(sealArtFor(art, "林武", "Lin Wu")).toBeNull();
    expect(sealArtFor(art, undefined, "Ming Zi")).toBeNull();
    expect(sealArtFor(null, "名字", "Ming Zi")).toBeNull();
    expect(sealArtFor({ name: "名字", glyphs: [] }, "名字", "Ming Zi")).toBeNull();
  });
  test("the persona's seal is cut in small seal script: 语墨之印 (罗 has no seal form)", () => {
    // 「罗」晚于篆书，《说文解字》里没有它的篆文字形 —— 章刻的是「语墨」这个字，章仍属于罗语墨
    expect(seal?.name).toBe("罗语墨");
    expect(sealArtFor(seal, "罗语墨", "Molly")?.glyphs.map((g) => g.char).join("")).toBe("语墨之印");
  });
});
