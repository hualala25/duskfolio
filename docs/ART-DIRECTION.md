# duskfolio — art direction: 黄昏の窓辺 (dusk by the window)

Direction D (2026-11-09). Adapted from sasshi's 朝の光 (morning light): the same room, the same window, the same light — but the
sun is low instead of rising, and the whole palette is warm instead of cool. The brief: 「粉色、黄昏时刻的窗边」 — pink, the light of a
window at dusk. Light only.

## The idea

The page is a rose-grey room late in the day. The last sun comes through a window at the top right and lays one soft patch of light
across the desk; the shadow of the window bar and a twig with leaves falls across it and over the booklet lying in that light. What
lies in the sun is warm and what lies in the shade keeps the cool violet of the dusk sky — the one rule that makes the room read as
*dusk* rather than as a lit room. The words sit in the shade on the left, set like the front matter of a Japanese book: 名 the name
(with a vertical nameplate), 序 the bio, 目次 the booklets, and 奥付 the colophon. A vertical running title (柱, hashira) stands in the
outer margin. There are no containers: no pill, no tray, no chip. Controls are printed words on the page's one bottom line.

## Colour (和色)

| Token | Hex | Use |
|---|---|---|
| 薄暮 hakubo | `#e9dcd6` | the desk; the 3D canvas clears transparent over it |
| 白壁 shirokabe | `#f4ebe5` | raised surfaces (the avatar disc, the Profile sheet) |
| 白粉 hakufun | `#faf4ef` | DOM paper (the text version, the 明信片 back) |
| 墨 sumi | `#2b1f24` | names, the active booklet, values — plum-black, never blue-black |
| 鉄鼠 tetsu | `#4d3d42` | body text |
| 琥珀 kohaku | `#6d5a5f` | labels, counts, hints |
| 霞 kasumi | `#cdbcc2` | hairlines |
| 薄墨 usuzumi | `#a2909a` | leader dots, disabled arrows (never meaningful text) |
| 紅 beni | `#a63b4e` | the one accent: the active disc, focus, "Copied", the seal and ○ marks in print |

Shadows are plum-black (`rgb(43 30 36)`), never black and never blue. **The old rule — "no warm colour in the chrome or the print;
warm colour exists only inside photographs" — is reversed for dusk**: the warm belongs to the *light*, not to the objects. The
chrome carries no saturated warm hue; the sun's warmth is in `STUDIO.sun` (the directional light) and in the room's own gradient, and
it lands on the paper rather than in the ink.

The three booklets wear a family of covers, all warm: 桃 momo (the assignment album), 桜 sakura (the paper album), 臙脂 enji (the
folio). The full set of eleven (`src/book/cover-style.ts`): shiro, momo, sakura, usubeni, fuji, kohaku, kikka, nissen, ro, sumi, enji.

Contrast, measured on the desk (`rgb(233 220 214)`): body text 7.6 : 1, labels 4.8 : 1, accent 4.7 : 1, names 11.8 : 1 — all above
4.5 : 1. The accent on white paper is 6.3 : 1.

## Type

Shippori Mincho (serif: names, titles, the booklets, bio, anecdotes), Zen Kaku Gothic New (sans: everything else), Klee One
(handwriting: the polaroid, postcards, the note). For a Chinese profile, Han glyphs come from Noto Serif SC, Noto Sans SC and
LXGW WenKai; Latin always comes from the Japanese faces, so English looks the same in every language (src/fonts). No capitals in
the DOM, no italics, no mono web font. Numbers are tabular.

The card album's Han titles are set in the face of their own script (`hanLangOf`), not in the Japanese Mincho: a Chinese course
name is Chinese, not 和色.

## Light

Real light, not a film over the book (owner, round 3). The window bars and the twig with its leaves are occluders in the 3D scene,
lit by one far sun (src/book): their shadow falls on the desk and goes on over the booklet with parallax and its own shading —
stronger on pale paper, faint on dark leather, a highlight on the pouch film. It keeps off the words: the engine fades its light on
the desk in screen space before the words column and the hands row (on a phone, the header and the foot), from the edges the page
gives it (`layout.ts` lightFade). The twig may sway a little (a few renders a second), never while a detail view or the Profile
sheet is up and never in a hidden tab.

The two lights are the whole picture (`src/book/scene.ts`, `STUDIO`): `sun` is the low warm sun (`0xffd0b2`, rose-gold) and `key` is
the cool violet of the sky filling the shade (`0xefe4f4`). They mix to a near-neutral on the page, so what is in the sun stays warm and
what is not stays cool. The exposure sits at 1.30 — a dusk room is a shade dimmer than a morning one.

The page's own room is one still layer under the transparent canvas (`Room.tsx`), painted once: 薄暮 with washi fibres, the corner
away from the window falling into a cool violet shade, the lit patch with the shade round it and its warm glow, paper tooth.
Nothing of the page lies over the canvas, nothing blends over it, nothing animates for ever. On a first load the light rises with the
load (daybreak). The flat book, the printed version and the text views keep a still window bar and twig of their own on that layer.
A detail view lays a plain veil over the room (no backdrop blur); the booklet behind it goes soft and half transparent and stands
still.

## Layout

A 12-column grid (margin 48, gutter 24 at ≥ 1360; margin 40 below): the 204 px words column, one empty column of 間, then the book
box to the right margin; the two albums, whose open spreads are wide, reach into the 間 column (a gutter short of the words).
The DOM computes the book box (src/app/layout.ts) and hands it to the engine as camera insets; the canvas is full-bleed and never
clipped. Phones: a header (name, booklet tabs), the book box full width, a hint, and a bottom row
(Profile, controls); the bio, colophon and case switch move into the Profile sheet. Landscape phones: a 172 px column beside the
book; tablets the phone structure, one page at a time in portrait, the open spread when the window is held landscape. The detail
view keeps the same frame: the caption takes the words column plus the 間 column, the object is held large in the book box, the
hashira names the object (名帖, 経歴書, 課題票, 写真, 一筆箋, 論集, 課題札). On a phone the object's top edge sits 24 px under the
book box's top and the caption hangs 14 px under its foot (the business card's caption follows it down when it unfolds); a
landscape tablet window sets the caption beside the object, as on a desk. The ticket, polaroid and note stills carry their own
lift shadow, baked by the pouch from the object's silhouette (the desk shows through the ticket's punch); the page adds none.
A Chinese page pairs its Han running title with the small Latin line (学术履历 — Academic CV · 05) as a bilingual colophon would:
the Han line is what a screen reader meets, the Latin line is decoration.

## The full specification

The values (every token, size, geometry and state) live in the code (`src/app/app.css`, `src/app/layout.ts`); `docs/DESIGN.md` lists the decisions.
