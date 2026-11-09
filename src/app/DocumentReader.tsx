import { useMemo } from "react";
import { profileHan } from "../fonts";
import type { DocBlock, Document } from "../profile/document";
import { bed } from "../profile/bed";
import { run, textProps, useFontRuns } from "./fonts";

/*
 * The document reader: the body of a paper or an assignment, read on the page.
 *
 * The .docx is not a picture of a document — it is the document. Clicking a paper or an assignment opens
 * its words here, set in the page's own faces, with its figures and tables in place. The file itself is
 * still offered below, for anyone who wants the original.
 *
 * The blocks come from profile/documents/<name>.ts (bun run docx).
 */

/** One figure: the picture and its caption. */
function Figure({ block }: { block: Extract<DocBlock, { kind: "figure" }> }) {
  const src = block.src ? bed(block.src) : "";
  return (
    <figure className="doc-fig">
      {src ? (
        <img src={src} alt={block.caption ?? ""} loading="lazy" decoding="async" />
      ) : (
        <div className="doc-fig-none" aria-hidden="true" />
      )}
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  );
}

/** One table: the first row is its head. */
function Table({ block }: { block: Extract<DocBlock, { kind: "table" }> }) {
  const [head, ...rows] = block.rows;
  if (!head) return null;
  return (
    <div className="doc-table-wrap">
      <table className="doc-table">
        <thead>
          <tr>
            {head.map((c, i) => (
              <th key={i} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The document, read on the page. `dense` is the paper's own reading (a document with many tables and
 * figures); the assignment's is the same, so one setting serves both.
 */
export function DocumentReader({ doc, className }: { doc: Document; className?: string }) {
  const han = profileHan({ lang: "zh-CN" });
  // every string in the document, so the Han faces are fetched before it is set
  useFontRuns(
    useMemo(
      () =>
        doc.blocks.flatMap((b) => {
          // a heading is set in 500 (the body's own weight is 400)
          if (b.kind === "h") return run("serif", 500, han, b.text);
          if (b.kind === "p" || b.kind === "subtitle") return run("serif", 400, han, b.text);
          if (b.kind === "figure") return run("sans", 400, han, b.caption);
          return b.rows.flatMap((r) => run("sans", 400, han, ...r));
        }),
      [doc, han],
    ),
  );

  return (
    <div className={["doc-body", className].filter(Boolean).join(" ")}>
      {doc.title ? (
        <h2 className="doc-title" {...textProps(doc.title, "zh-CN", han)}>
          {doc.title}
        </h2>
      ) : null}
      {doc.blocks.map((b, i) => {
        if (b.kind === "h") {
          const level = Math.min(3, Math.max(1, b.level));
          const Tag = (level === 1 ? "h3" : level === 2 ? "h4" : "h5") as "h3" | "h4" | "h5";
          return (
            <Tag key={i} className="doc-h" data-level={level} {...textProps(b.text, "zh-CN", han)}>
              {b.text}
            </Tag>
          );
        }
        if (b.kind === "subtitle")
          return (
            <p key={i} className="doc-sub" {...textProps(b.text, "zh-CN", han)}>
              {b.text}
            </p>
          );
        if (b.kind === "p")
          return (
            <p key={i} className="doc-p" {...textProps(b.text, "zh-CN", han)}>
              {b.text}
            </p>
          );
        if (b.kind === "figure") return <Figure key={i} block={b} />;
        return <Table key={i} block={b} />;
      })}
    </div>
  );
}
