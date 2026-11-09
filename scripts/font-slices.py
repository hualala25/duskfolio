#!/usr/bin/env python3
"""
Which font slices does the site actually need?

The fontsource CSS names each slice's unicode-range. A browser only downloads the slice that holds a
character it is about to draw — but the build ships every slice (1259 files, 37 MB), and on a slow
connection those 40-odd parallel slice requests starve the JavaScript that has to arrive first.

This reads each face's CSS, works out which slice holds which character, and reports the slices the
site's own text can reach. The build then keeps only those.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
NODE = ROOT / "node_modules" / "@fontsource"

# the faces the site uses, and where their CSS is
FACES = {
    "noto-sans-sc": ["300.css", "500.css"],
    "noto-serif-sc": ["400.css", "500.css", "600.css"],
    "lxgw-wenkai-webfont": None,  # its files are one whole font, not sliced
    "shippori-mincho": ["400.css", "500.css", "600.css"],
    "zen-kaku-gothic-new": ["400.css", "500.css"],
    "klee-one": ["600.css"],
}


def parse_ranges(spec: str) -> list[tuple[int, int]]:
    """`U+4e00-9fff,U+ff01` → [(0x4e00, 0x9fff), (0xff01, 0xff01)]"""
    out = []
    for part in spec.split(","):
        part = part.strip().upper()
        if not part.startswith("U+"):
            continue
        body = part[2:]
        if "-" in body:
            a, b = body.split("-", 1)
            try:
                out.append((int(a, 16), int(b, 16)))
            except ValueError:
                pass
        else:
            try:
                v = int(body, 16)
                out.append((v, v))
            except ValueError:
                pass
    return out


def slices_of(css_path: pathlib.Path) -> dict[str, list[tuple[int, int]]]:
    """the file name → the ranges it holds"""
    if not css_path.exists():
        return {}
    text = css_path.read_text(encoding="utf-8")
    out: dict[str, list[tuple[int, int]]] = {}
    for m in re.finditer(
        r"@font-face\s*\{[^}]*?src:\s*url\(\./files/([^)]+?)\)[^}]*?unicode-range:\s*([^;]+);",
        text,
        re.S,
    ):
        name, spec = m.group(1), m.group(2)
        out[name] = parse_ranges(spec)
    return out


def main() -> int:
    # every character the site can draw
    chars: set[str] = set()
    for pat in ("profile/*.ts", "profile/documents/*.ts", "src/**/*.ts", "src/**/*.tsx"):
        for f in ROOT.glob(pat):
            try:
                t = f.read_text(encoding="utf-8")
            except Exception:
                continue
            for ch in t:
                if ord(ch) > 0x2000:
                    chars.add(ch)
    print(f"站点可能显示的字符：{len(chars)} 个")

    keep: set[str] = set()
    total = 0
    for pkg, csses in FACES.items():
        if csses is None:
            continue
        for css in csses:
            p = NODE / pkg / css
            sl = slices_of(p)
            total += len(sl)
            for name, ranges in sl.items():
                # the latin slices (their name has no number) are always needed
                if not re.search(r"-\d+-", name):
                    keep.add(f"{pkg}/{name}")
                    continue
                for ch in chars:
                    cp = ord(ch)
                    if any(a <= cp <= b for a, b in ranges):
                        keep.add(f"{pkg}/{name}")
                        break

    print(f"全部片：{total}，需要的：{len(keep)}")
    print(f"可以省掉：{total - len(keep)} 片")

    out = ROOT / ".font-slices-keep.txt"
    out.write_text("\n".join(sorted(keep)) + "\n", encoding="utf-8")
    print(f"清单写入 {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
