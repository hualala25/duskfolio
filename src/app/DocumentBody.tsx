import { useEffect, useState } from "react";
import type { Document } from "../profile/document";
import { loadDocument } from "../../profile/documents";
import { DocumentReader } from "./DocumentReader";

/*
 * The document, read on the page.
 *
 * Click a paper or an assignment that has a body, and its words are here — not a link to a file that
 * opens somewhere else. The body itself lives in profile/documents/ and is fetched when it is first
 * needed (a visitor who never opens a paper never downloads it).
 */

type Props = {
  /** The document's name (profile/documents/<name>.ts). */
  name: string | undefined;
  /** The class the page is in (the reader's own layout follows it). */
  cls: string;
};

/** The document, or nothing while it is on its way. */
export function DocumentBody({ name, cls }: Props) {
  const [doc, setDoc] = useState<Document | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let dead = false;
    setDoc(null);
    setFailed(false);
    if (!name) {
      setFailed(true);
      return;
    }
    void loadDocument(name).then((d) => {
      if (dead) return;
      if (d) setDoc(d);
      else setFailed(true);
    });
    return () => {
      dead = true;
    };
  }, [name]);

  if (!doc) {
    return (
      <div className="doc-sheet" data-state={failed ? "none" : "loading"}>
        {failed ? <p className="doc-none">正文没有找到。</p> : <p className="doc-none">正在取正文…</p>}
      </div>
    );
  }
  return (
    <div className="doc-sheet" data-cls={cls}>
      <DocumentReader doc={doc} />
    </div>
  );
}
