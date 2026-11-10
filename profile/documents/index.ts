/*
 * 正文的登记处 —— 由 scripts/sync-content.ts 自动生成，别手改。
 *
 * 卡片上写 doc: "名字"，详情视图打开时才下载那一篇（没打开的访客不会付出流量）。
 * 现在有 2 篇：ai-glasses、heat-mirror
 */

import type { Document } from "../../src/profile/document";

/** 名字 → 拿正文的那个模块。 */
const loaders: Record<string, () => Promise<{ document: Document }>> = {
  "ai-glasses": () => import("./ai-glasses"),
  "heat-mirror": () => import("./heat-mirror"),
};

/** 有哪些正文。 */
export const documentNames = (): string[] => Object.keys(loaders);

/** 取一篇正文；没有就叫 null。 */
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
