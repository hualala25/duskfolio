/*
 * The documents: the bodies of the papers and the assignments, read on the page.
 *
 * A profile's card or postcard points at one of these by name (`doc: "ai-glasses"`), and the detail view
 * fetches it when you open that item — so a visitor who never opens a paper never downloads its body.
 *
 * To add one: run `bun run docx <file.docx> <name>` (it writes profile/documents/<name>.ts), then add a
 * line to the loaders below and point a card or a postcard at it.
 */

import type { Document } from "../../src/profile/document";

/** The loaders: a name → the module that holds its body. */
const loaders: Record<string, () => Promise<{ document: Document }>> = {
  "ai-glasses": () => import("./ai-glasses"),
  "heat-mirror": () => import("./heat-mirror"),
};

/** The names of the documents there are. */
export const documentNames = (): string[] => Object.keys(loaders);

/** A document's body, or null when there is none by that name. */
export async function loadDocument(name: string | undefined): Promise<Document | null> {
  if (!name) return null;
  const loader = loaders[name];
  if (!loader) return null;
  try {
    const m = await loader();
    return m.document;
  } catch {
    return null;
  }
}
