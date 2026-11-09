import { describe, expect, test } from "bun:test";
import { profile as sample } from "../../../profile/en";
import { profileZh as sampleZh } from "../../../profile/zh";
import { createCardContent } from "./cards";
import { sameGrid } from "./grid";
import { createPostcardContent } from "./postcards";

describe("an album in another language replaces the one in the book (brief r4 E1)", () => {
  test("the sample's English and Chinese albums are the same grid", () => {
    expect(sameGrid(createCardContent(sample.albums.cards), createCardContent(sampleZh.albums.cards))).toBe(true);
    expect(sameGrid(createPostcardContent(sample.albums.postcards), createPostcardContent(sampleZh.albums.postcards))).toBe(true);
  });
  test("other pictures, another layout or other items are not", () => {
    // the paper album prints a generated dusk sky when a card carries no photograph, so the
    // pictures are what a grid is identified by — the fixture below gives it some
    const pc = sample.albums.postcards;
    const shot = pc.map((p, i) => ({ ...p, src: `photos/paper-${i}.jpg` }));
    const moved = shot.map((p, i) => ({ ...p, src: shot[(i + 1) % shot.length]!.src! }));
    expect(sameGrid(createPostcardContent(shot), createPostcardContent(moved))).toBe(false);
    expect(sameGrid(createPostcardContent(pc), createPostcardContent(shot))).toBe(false);
    expect(sameGrid(createCardContent(sample.albums.cards), createCardContent(sample.albums.cards, "idCard2x3"))).toBe(false);
    expect(sameGrid(createCardContent(sample.albums.cards), createCardContent(sample.albums.cards.slice(1)))).toBe(false);
  });
});
