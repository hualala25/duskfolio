# duskfolio —— 完整方案

> 上游：[qzz0518/sasshi](https://github.com/qzz0518/sasshi)（AGPL-3.0-only + CLA）
> 本目录：`/Users/luoyumo/WorkBuddy/2026-11-09-14-05-19/duskfolio`
> 状态：**配色、内容、测试、构建全部完成并验证通过**（355 测试绿 / typecheck 过 / 生产构建过 / 三档视口无报错）

---

## 一、先说结论

`sasshi` 是一个**成熟度很高的「实物册子」个人主页引擎**：36k 行 TypeScript，Three.js 负责三维活页夹与拉链袋，Planck.js 负责袋中物件的二维刚体物理，全部实时模拟。

你要的三件事——**形式照旧、只换粉色黄昏配色、内容换成课程作业和论文**——恰好落在它设计上最省力的地方：

| 你的要求 | sasshi 的现状 | 改造量 |
|---|---|---|
| 整体形式一样 | 三本册子 + 一只透明拉链袋，物理翻页、拖拽、晃动 | **0 行引擎改动** |
| 整体色调粉色 · 黄昏窗边 | 颜色分散在 4 个互不引用的层里 | 50 个文件，但全是机械替换 + 少量语义修改 |
| 内容是课程作业和论文 | 全站只有 `profile/` 三个文件决定内容 | 换掉 `profile/`，别的不用动 |
| 其余都一样 | — | — |

**没有新建第四本册子、没有重写渲染器、没有引入任何新依赖。** 这是「在其上改」而不是「另写一个」。

---

## 二、仓库评估：sasshi 到底是什么

### 2.1 架构

```
profile/          ← 唯一的内容源（你只需要改这里）
  content.ts        ★ 新增：中英共用的骨架（课程 / 论文）
  zh.ts  en.ts      ★ 重写：人物资料
  index.ts          ★ 改：primary 换成 zh
src/
  app/             页面外壳：文字栏、房间、册子切换、详情视图、文字版、JSON 视图
  book/            活页夹引擎：纸页柔性链、热封折痕、磨砂封面、窗口光影
  bag/             拉链袋：Planck.js 刚体世界 + three.js 渲染
  paper/           纸面查看器：A4 排版与翻页、名片展开、滚轮缩放
  print/           印章（���篆）、禁则处理
  profile/         数据模型（schema）
```

### 2.2 三本册子 ↔ 物理载体

| | 物理 | 网格 | 原作装什么 | 现在装什么 |
|---|---|---|---|---|
| 课程作业册 | 带透明 PVC 内页的活页夹 | 每面 2×4（8 张） | 32 张和色色卡 | **32 张作业卡**（8 门课 × 4） |
| 论文册 | 带 A6 内页的活页夹 | 每张 2×3（6 张） | 12 张旅行明信片 | **12 张论文卡**（一张一篇） |
| 学术履历 | 对开文件夹 + 透明拉链袋 | — | 名片/简历/门票/拍立得/便笺 | **名帖/履历/选题票/照片/便笺** |

### 2.3 一套内容，三种投影

同一份 Profile 同时驱动：
- **3D 册子**（`?` 无参数）
- **文字版**（`?view=text`）—— 可搜索、可爬取的纯 HTML
- **JSON 版**（`?view=json`）—— 机器可读
- 另有给读屏软件的无声孪生 DOM

这是它最值钱的设计：**你的内容只写一次，四种呈现自动同步**。

### 2.4 许可（硬约束，必须知道）

上游是 **AGPL-3.0-only + CLA**。含义：

1. 你**可以**免费用于个人主页、课程作业、论文、求职作品集。
2. 你**必须**公开你部署的这份源码 —— 页脚的「源码」链接由 `profile.source` 驱动，填你自己 fork 的地址即可。
3. 想闭源商用要单独买授权（上游作者的商务邮箱在 README 里）。
4. **署名**：本项目是上游的衍生作品，LICENSE 与 `profile/seal-OFL.txt`（字体）都请保留。`CLA.md` 是给贡献者的，你不必签。

---

## 三、配色方案：黄昏の窓辺

### 3.1 核心 token（原 → 新）

CSS 变量已随语义一并改名（不是只改值）：

| 原 | 新 | 值 | 用途 |
|---|---|---|---|
| `--asagiri` 朝霧 | `--hakubo` 薄暮 | `#e9dcd6` | 桌面 |
| `--hakuji` 白磁 | `--shirokabe` 白壁 | `#f4ebe5` | 抬起的表面 |
| `--gofun` 胡粉 | `--hakufun` 白粉 | `#faf4ef` | DOM 纸 |
| `--sumi` 墨 | `--sumi` 墨 | `#1c232b` → `#2b1f24` | 名字、值（**梅黑**，不再是蓝黑） |
| `--tetsu` 鉄鼠 | `--tetsu` 鉄鼠 | `#36424e` → `#4d3d42` | 正文 |
| `--ainezu` 藍鼠 | `--kohaku` 琥珀 | `#4f5d69` → `#6d5a5f` | 标签、计数 |
| `--shironezu` 白鼠 | `--kasumi` 霞 | `#c2cbd2` → `#cdbcc2` | 细线 |
| `--usuzumi` 薄墨 | `--usuzumi` 薄墨 | `#8e9aa4` → `#a2909a` | 引点、禁用箭头 |
| `--ai` 藍 | `--beni` 紅 | `#2f4f73` → `#a63b4e` | **唯一强调色** |
| `--pen` | `--pen` | `#24324a` → `#4a2c34` | 手写 |
| `--sh` | `--sh` | `21 35 58` → `43 30 36` | 阴影墨（梅紫） |

### 3.2 颜色分散在四层 —— 全部已处理

| 层 | 位置 | 关键改动 |
|---|---|---|
| ① CSS token | `src/app/app.css` | 9 个和色 token + `--sh` + `--glass` + `.falloff` |
| ② 书籍 CSS | `src/book/book.css` | `--fb-*` 材质、`--cv-foil` 烫金/银箔、金属活页环、橱窗幽灵卡 |
| ③ Three.js | `src/book/scene.ts` | `STUDIO` 灯光、`BG` 桌面、环境穹顶的色偏 |
| ④ Canvas 印刷 | `shared.ts` `PRINT` / `textures.ts` `PALETTE` / `cover-style.ts` `COVER_HEX` / `postcards.ts` / `ticket.ts` / `note.ts` / `polaroid.ts` / `card.ts` / `resume.ts` / `pouch.ts` | 印刷墨、纸张、票根、便笺、拍立得、袋膜 |

蓝黑墨 `rgb(21 35 58)` 在全仓出现 **17 处**，`rgb(47 79 115)`（藍）**10 处** —— 已全部改写，不会留下冷色残渣。

### 3.3 灯光：黄昏的三个杠杆（最关键）

`src/book/scene.ts` 的 `STUDIO`：

```ts
const STUDIO = { key: 0xefe4f4, sun: 0xffd0b2, sky: 0xf2e4ee, ground: 0xc9aab0, shadow: 0x2b1e22 };
const EXPOSURE = 1.30;              // 原 1.36：黄昏的房间比清晨暗一档
const SUN = { share: 0.58, ... };   // 原 0.53：直射的暖光占比更大，明暗对比更强
```

- `sun` = 低角度的落日（玫瑰金暖光），落在纸上的部分保持暖
- `key` = 阴影里天光的冷紫（`0xefe4f4`），阴影里的部分保持冷
- **暖光归光，不进油墨** —— 这是黄昏能读出来的唯一规则

DOM 房间层（`src/app/Room.tsx`）：`.sun` 渐变四档改为暖橙序列，`.lift` 辉光改为暖玫瑰，`.falloff` 角落阴影改为**冷紫** `rgb(168 146 164 / .40)` —— 暖光区与冷影区的对撞就是黄昏感。

环境贴图穹顶（`studioScene()`）的蓝偏 `v*1.04` 改为紫偏 `v*0.99 / v*1.04`。

### 3.4 封面家族（11 种全换）

| 原 | 新 | 说明 |
|---|---|---|
| 青磁 seiji | **桃 momo** `#e6b0a8` | 课程作业册 |
| 銀鼠 ginnezu | **桜 sakura** `#e9bfc9` | 论文册 |
| 藍鉄 aitetsu | **臙脂 enji** `#8f2f43` | 学术履历夹 |
| paper/fog/sand/sage/slate/moss/clay/ink | **白/炉/菊/琥珀/藤/薄紅/紅/墨** | 全部换成暖粉家族 |

### 3.5 对比度校验（脚本 `tools/contrast.py`，全过）

| 组合 | 比值 | 要求 |
|---|---|---|
| 正文 鉄鼠 / 桌面 | **7.60 : 1** | ≥ 4.5 |
| 标签 琥珀 / 桌面 | **4.78 : 1** | ≥ 4.5 |
| 强调 紅 / 桌面 | **4.67 : 1** | ≥ 4.5 |
| 名字 墨 / 桌面 | **11.84 : 1** | ≥ 4.5 |
| 强调 紅 / 纯白 | **6.26 : 1** | ≥ 4.5 |
| 引点 薄墨 / 桌面 | 2.24 : 1 | ≥ 2.0（不承载语义） |

### 3.6 一条被推翻的旧规则

上游 `docs/ART-DIRECTION.md` 明写：

> Shadows are blue-black (`rgb(21 35 58)`), never black or warm. **No red, green or warm colour anywhere in the chrome or the print**; warm colour exists only inside photographs.

黄昏必然引入暖色，所以这条被改写为：

> 阴影是梅紫黑（`rgb(43 30 36)`），不是黑也不是蓝。**暖色属于光，不属于物**：界面与印刷里没有饱和暖色，暖只出现在直射光与它落在纸上的地方。

`docs/ART-DIRECTION.md` 已整篇重写（Direction D）。

---

## 四、内容方案：课程作业 + 论文

### 4.1 语义映射（保留全部物理形态，只换意义）

| 载体 | 原语义 | 新语义 | 说明 |
|---|---|---|---|
| 卡册卡面 | 和色色卡 | **作业卡** | 卡面印：课程号 + 作业名（左下）、序号（右上）、课程色块 |
| 明信片正面 | 旅行照片 | **程序生成的黄昏天空** | 由论文的 `color` 驱动，12 篇各不相同；卡面即论文的封面 |
| 明信片背面 | 郵便はがき | **明信片（中文版式）** | 抬头按语言切换：中文印「明信片」，英文印「郵便はがき」 |
| 名片 | 商务名片 | **名帖** | 姓名 / 专业方向 / 联系方式 / 邮箱 / GitHub / 语言 |
| 简历纸 | 履历 | **学术履历** | 学业、竞赛、项目、技能、语言（引擎原样排 A4 两页） |
| 票根 | 大会门票 | **选题票** | 印：赛事、题目、教师、截止、赛区、成绩、编号 |
| 拍立得 | 风景照 | **照片** | 题字 / 背面手写 / 地点 / 日期 |
| 便笺 | 留言 | **便笺** | 给访客的一段话 |

### 4.2 文件分工（关键设计：两份语言不会走形）

```
profile/content.ts   ← 中英共用的骨架（8 门课 × 4 张作业卡 + 12 篇论文）
                       每门课一个色系，四张卡由浅到深；每个字段都带 zh/en 两套文字
profile/zh.ts        ← 中文资料：名字、链接、履历、袋中五物
profile/en.ts        ← 英文资料：同形状，不同文字
profile/index.ts     ← primary: "zh"，en 按需加载
```

**两版从同一份骨架派生，形状必然一致** —— `shapeDiff()` 永远返回空，`bun test src` 会替你盯着这一点。改一门课或一篇论文，只改 `content.ts`，中英同时变。

### 4.3 现在的内容状态

| | 状态 |
|---|---|
| **课程作业册**（32 张） | **占位**：课程1…课程8（课程号 CRS001…CRS008），每门课四张卡：作业1…作业4 |
| **论文册**（12 张） | **第一篇是真的**：《从「举起手机」到「眨一下眼」：AI眼镜时代日常拍摄的社交边界消解与重构》——全文在 `public/papers/AI眼镜社交边界.docx`，详情页有「全文」链接；其余十一篇是**占位**（论文2…论文12） |
| **学术履历** | **一段**：公益广告大赛 · 二等奖（2026）。其余两段留空，代码里有一行注释说明怎么加 |
| **小篆名章** | 已用 `bun run seal 罗语墨` 刻出「**语墨之印**」四个篆字（写进 `profile/seal.ts`）——「罗」没有篆体形，章刻的是「语墨」这个字 |
| **照片** | 没有照片：明信片正面与拍立得都由程序画出来（一片黄昏天空 / 一张凌晨书桌） |

### 4.4 三条引擎硬约束（踩过的坑，已写进测试）

| 约束 | 上限 | 怎么算的 |
|---|---|---|
| **组织名不能被拆行**（`typeset.ts` 的 `wrapSpans` keep 语义） | 英文组织名 **≤ 24 字符**，中文 **≤ 12 全角** | A4 内容列 123.9mm，扣掉年份栏；字号 2.75mm 随比例放大，2 倍时最紧 |
| **论文摘要不能超过 7 行** | 中文 **≤ 82 字**，英文 **≤ 157 字符** | 明信片背面 65.4mm 宽、5.6mm 字、10mm 行距，7 行 |
| **中英必须同形** | items 的 id/种类/顺序、卡片的 id/颜色、明信片的 id/颜色 | `shapeDiff()` + `sameGrid()` |

> 这三条都写进了 `src/profile/sample.test.ts`，你以后加内容时，`bun test src` 会立刻告诉你哪里超了。

---

## 五、你必须改的清单（大约 15 分钟）

> **身份已经改好了**：罗语墨 / Molly，西安，GitHub `hualala25`，小篆名章已刻。
> 剩下的是**内容** —— 下面第五、六节列的每一项都还是我写的示例。

### 5.0 已完成：身份与名章

| 项 | 值 |
|---|---|
| 汉字名 | **罗语墨**（`IDENTITY.nameLocal`）—— 中文版的名牌、藏书票、简历页眉 |
| 拉丁名 | **Molly**（`IDENTITY.name`）—— 英文版的名牌 |
| 账号 | `@hualala25` |
| 城市 | 西安 / Xi'an |
| 邮箱 | `hualala25@users.noreply.github.com`（GitHub 的不回信地址，不泄露真实邮箱；换成你自己的也行） |
| 源码 | `https://github.com/hualala25/duskfolio`（**fork 之后改成你实际的仓库名**，页脚的「源码」链过去，AGPL 要求） |
| 名章 | **语墨之印**，小篆，四字，2×2 |

> **关于名章**：「罗」晚于篆书，《说文解字》里没有它的篆文字形 —— 所以那一方章刻的是「**语墨**」
> 这个字（正好是你说的那个备选），章仍然属于「罗语墨」这个名字。
> `scripts/seal.ts` 已改成：某个字没有篆体形时不放弃整方章，而是用它能刻的那几个字去刻
> （`bun run seal 罗语墨` 会打印「No small seal form for 罗: the seal is cut from 语墨 instead.」）。
> 想换别的组合，把名字传给它重刻即可。

> ⚠️ **一条重要的提醒**：履历里那三段经历、论文里那些数字（22 位受访者、1.2 万阅读、预算六千、
> 十八份问卷……）**全是我按你的情况编的**。页面上印的是它们，不是你的真实经历 ——
> 请逐条换成你真做过的，或者干脆删掉没做过的那些。代码里已经加了 `⚠️` 注释标着。

### 5.1 身份（已改，不用动）

**`profile/content.ts` 第 366–373 行** —— 名字、城市、账号都已经填好了。要改就改这里，
然后**必须**重刻章：

```bash
bun run seal 罗语墨      # 重写 profile/seal.ts
```

> 忘了这步：藏书票上的章仍是旧名字，但名字已经是你的 —— 对不上。

### 5.2 中文资料（`profile/zh.ts`）

| 行 | 字段 | 现在是什么 | 改成 |
|---|---|---|---|
| 53 | `role` | `"网络与新媒体 · 智能传播方向"` | 已填好（专业 + 方向） |
| 56 | `bio` | 一段关于课程作业和论文的介绍 | 已填好，可按你喜欢的语气改 |
| 57 | `coverTitle` | `${nameLocal} · 课程作业与论文` | 想改就改 |
| 60 | `source` | `https://github.com/hualala25/duskfolio` | fork 之后改成你实际的仓库名（AGPL 硬要求） |
| 63 | `links[0]` | `mailto:hualala25@users.noreply.github.com` | 已填好；想用真邮箱就换 |
| 64 | `links[1]` | `https://github.com/hualala25` | 已填好 |
| 78 | `front`（名帖正面） | 罗语墨 / 身份 / 一句标语 | 已填好 |
| 80 | `inside`（名帖内侧） | 邮箱 / 主页 / 所在 / 语言 | 已填好 |
| 84–127 | 学术履历 | 一段：**公益广告大赛 · 二等奖**；教育、技能、语言各一行 | 比赛全名与参赛作品待你补；技能/语言两行也是示例 |
| 131–150 | 选题票 | 数字编辑创新大赛的选题凭证 | 已填好（赛事、题目、赛区、编号） |
| 152–162 | 照片 | 图书馆 19:40 | 可换你自己的照片，或换一段文字 |
| 164–170 | 便笺 | 给访客的一段话 | 你写的话 |
| 26–35 | `assignmentCards` | 每门课一张卡 + 一句话说明 | 你的作业 |

### 5.3 英文资料（`profile/en.ts`）

结构与中文版一一对应，**只改文字、不改结构**（改了形状测试会红）。名字已填好：Molly / 罗语墨。
第 39（`role`）、42（`bio`）、45（`source`）、48–49（`links`）、63（名帖）、
87/98/109（履历三段角色）—— 履历那三段同样是我编的，换成你真实做过的。

### 5.4 课程与论文（`profile/content.ts`）

| 位置 | 数量 | 内容 |
|---|---|---|
| `COURSES` | 8 门课 × 4 张卡 = **32 张** | 占位。`course(n, colors)` 生成一门课：课程号 `CRS00n`、四个由浅到深的色、`课程n` + 四张 `作业n`。换成真课时照这个形状写 |
| `PAPERS` | **12 篇** | `p01` 是真的那篇（有日期、有全文链接）；`paper(n, color)` 生成占位的论文n（**没有日期**，免得印一个假的邮戳） |

### 5.5 三条硬约束（超了测试会告诉你确切位置）

| 约束 | 上限 | 为什么 |
|---|---|---|
| 卡片上的中文作业名 | **≤ 6 字** | 卡面 85.6mm 宽、4mm 字，排不下会溢出 |
| 卡片上的英文作业名 | **≤ 20 字符** | 同上 |
| 论文摘要（中文） | **≤ 82 字** | 明信片背面 65.4mm 宽、5.6mm 字、7 行 |
| 论文摘要（英文） | **≤ 157 字符** | 同上 |
| 履历里的组织名（英文） | **≤ 24 字符** | A4 内容列 123.9mm，扣掉年份栏；2 倍字号时最紧 |
| 履历里的组织名（中文） | **≤ 12 全角** | 同上 |

> `bun test src` 会在你超限时直接指出是哪一个。

### 5.6 论文的全文（已做好）

第一篇论文的全文已经放进 `public/papers/AI眼镜社交边界.docx`，从论文的详情页点「AI眼镜社交边界.docx ↗」就能下载（已验证：站点取到的文件与原文件校验和一致）。

给别的论文也放全文：把文件放进 `public/papers/`，在 `PAPERS` 的对应一项里加
`href: { zh: "papers/文件名.docx", en: "papers/文件名.docx" }` 即可。

### 5.7 照片（可选）

`public/photos/` 现在是空的 —— 上游的 12 张日本旅行照已删除（备份在 `/tmp/upstream-photos-backup/`）。
你可以：

- **什么都不放** —— 明信片正面会自己画一片黄昏天空，拍立得会生成一张程序照片（现在就是这样）
- 放自己的照片：裁成 **148:105**（明信片）或 **1:1**（拍立得），宽度 1200–1600px，JPEG q74–82，
  写进 `profile/content.ts` 的 `src: "photos/xxx.jpg"`，并在 `public/photos/CREDITS.md` 和
  `manifest.json` 各登记一条（`public/photos/CREDITS.md` 已经改成模板，照着填）

### 5.8 不要改的地方

| 文件 | 为什么 |
|---|---|
| `LICENSE` | AGPL-3.0，删了就是违约 |
| `README.md` / `README.zh-CN.md` 里的「Copyright © 2026 qzz0518」 | **原作者署名，必须保留** |
| `profile/seal-OFL.txt` | 小篆字形的字体授权 |
| `CLA.md` / `CONTRIBUTING.md` | 上游的贡献协议 |
| `docs/DESIGN.md` / `docs/ART-DIRECTION.md` 里的「改编自 qzz0518/sasshi」 | 署名与出处 |
| `public/sounds/` | 44 个拟音与环境声（ElevenLabs 生成），是房间的底噪，不是人物内容。想关掉：`createSoundKit({ ambient: false })` |

### 5.9 改完跑一次

```bash
bun test src        # 355 个测试，会检查你新内容是否合规
bun run typecheck
bun run build
```

---

## 六、部署

### 6.1 GitHub Pages（推荐，最省事）

```bash
cd duskfolio
git init && git add -A && git commit -m "duskfolio: coursework & papers at dusk"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

然后在 GitHub 仓库 **Settings → Pages → Source 选 GitHub Actions**。每次推 `main` 自动构建部署，地址是
`https://<用户名>.github.io/<仓库名>/`。

> `.github/workflows/pages.yml` 已经在仓库里，**构建前会自动跑 `bun run typecheck`** —— 内容写错了会拦住部署。

### 6.2 换成自己的域名

`public/CNAME` 里写你的域名，DNS 加一条 CNAME 指向 `<用户名>.github.io`。GitHub Pages 自带 HTTPS。

### 6.3 备案（如果用中国大陆服务器或自定义域名指向国内主机）

域名解析到 GitHub Pages 在大陆的访问速度一般但可用；若要绑到国内服务器，需完成 ICP 备案。用 Cloudflare / Vercel / Netlify 则无需备案（但 Vercel 的免费版在大陆访问不稳定，**建议 Cloudflare Pages**）。

### 6.4 别的地方部署

构建命令 `bun run build`，输出目录 `dist`。所有路径都是相对路径（`base: "./"`），放子路径也能用。

---

## 七、日常维护：怎么加一篇论文 / 一门作业

### 加一门课（4 张作业卡）

打开 `profile/content.ts`，在 `COURSES` 里加一项：

```ts
{
  code: "NME131",                         // 课程号：3 个大写字母 + 3 位数字
  colors: ["#e9bfc9", "#ddaab4", "#d193a3", "#c27a8d"],  // 由浅到深
  zh: { course: "媒介心理学", cards: [
    { name: "注意力经济", note: "……" },   // 名字 ≤ 6 字，卡面才排得下
    { name: "认知负荷",   note: "……" },
    { name: "情绪传染",   note: "……" },
    { name: "媒介依赖",   note: "……" },
  ]},
  en: { course: "Media Psychology", cards: [ /* 同结构，英文 */ ] },
}
```

**注意**：
- 颜色必须**由浅到深**，且四张各不相同（测试会检查）
- 中文作业名 ≤ 6 个字，英文 ≤ 20 字符（卡面 85.6mm 宽，4mm 字）
- `note` 是详情面板里的一句话，中文以「。」结尾

### 加一篇论文

在 `PAPERS` 里加一项：

```ts
{
  id: "p13",                                // 顺延
  label: { zh: "课程论文", en: "Course paper" },   // 邮戳上的短标
  place: { zh: "数字采编实务", en: "Digital Production" },  // 收录载体
  message: { zh: "……（≤ 82 字）", en: "……(≤ 157 chars)" }, // 摘要
  date: "2026-11-20",
  color: "#c98f88",                         // 决定正面那片黄昏天空的颜色
}
```

**注意**：摘要超了 7 行会被静默截断（末尾加省略号）—— `bun test src` 会提前告诉你。

### 加一张照片（论文封面）

1. 裁成 **148 : 105**（明信片）或 **1 : 1**（拍立得），JPEG q74–82，≤ 250 KB
2. 放进 `public/photos/`
3. 在资料里写 `src: "photos/xxx.jpg"`（开头不加斜杠）
4. 在 `public/photos/CREDITS.md` 和 `manifest.json` 登记来源

> 有照片的明信片，正面是照片；没有照片的，正面是程序生成的黄昏天空。**两种都好看**，不必强求都配图。

---

## 八、风险与已知限制

| # | 事项 | 说明 | 处理 |
|---|---|---|---|
| 1 | **AGPL 义务** | 部署修改版必须公开源码 | 页脚「源码」链接指向你的 fork —— 已做好，只差改 `source:` |
| 2 | **署名** | 上游是别人的作品 | 保留 LICENSE、`profile/seal-OFL.txt`；在 README 注明改编自 sasshi（已写） |
| 3 | **无头环境 3D 降级** | 用软件渲染（SwiftShader）时，履历夹的 3D 会降级为印刷版 | **已验证上游 sasshi 在同环境下表现完全一致** —— 是环境限制，不是改造引入的。真实 GPU 上正常（册子类的 3D 在同环境已正常） |
| 4 | **字体体积** | 全部中日字体约 21 MB | 构建时只发 woff2（`vite.config.ts` 的 `woff2Only` 插件），首屏约 250 KB，且按语言切片按需加载 |
| 5 | **`seal` 需要联网** | 刻章要拉 OpenCC 字典 + 开元小篆字形 | 已加本地缓存：把文件放进 `.cache/seal/` 即可离线刻 |
| 6 | **履历排版上限** | 组织名长度、摘要行数有硬上限 | 已写进测试；`bun test src` 会报错并指出 |
| 7 | **内容真实性** | 目前的课程名、论文题目、成绩数字都是**示例** | 上面的清单就是替换它们的地方；不要保留示例里的数字 |

---

## 九、路线图

| 阶段 | 内容 | 状态 |
|---|---|---|
| **P0 · 配色** | 四层配色全改、灯光黄昏化、封面家族、对比度校验 | ✅ 完成 |
| **P1 · 内容** | 三本册子与五件物的语义改造、中英骨架、32 作业卡 + 12 论文 | ✅ 完成 |
| **P2 · 质量** | 测试重写（355 绿）、typecheck、生产构建、三档视口截图 | ✅ 完成 |
| **P3 · 文档** | ART-DIRECTION 重写、README 更新、seal 缓存兜底 | ✅ 完成 |
| **P4 · 你的内容** | 按第五节清单替换名字 / 课程 / 论文 / 照片 | ⬜ 待你做 |
| **P5 · 上线** | fork → GitHub Pages → 域名 | ⬜ 待你做 |

---

## 十、这次改动的文件清单

```
新增  profile/content.ts                 中英共用的内容骨架
重写  profile/zh.ts  profile/en.ts  profile/index.ts
      docs/ART-DIRECTION.md             Direction D：黄昏の窓辺
      README.md  README.zh-CN.md
      src/profile/sample.test.ts        内容规则的新测试
      tools/contrast.py                 对比度校验脚本（仓库外）

改色  50 个文件（src/ 45 + scripts/harness 14 + index.html + profile/*）
      其中语义修改集中在：
        src/app/app.css                  9 个 token + --sh + --glass + .falloff
        src/book/scene.ts                STUDIO / EXPOSURE / SUN.share / 环境穹顶
        src/book/cover-style.ts          COVER_HEX 11 种封面全换
        src/book/cover.ts                COVER_COLORS 键名与三本册子的封面
        src/app/booklets.ts              三本册子的封面与日文题签
        src/app/Room.tsx                 .sun 四档 / .lift / .falloff
        src/app/i18n.ts                  册名 / 物件名 / 规格标签 / 文字版节名
        src/bag/objects/ticket.ts        票面印的字（日期/截止/成绩/课程作业）
        src/book/content/cards.ts        汉字课程名用思源宋体，不用日文字体
        src/book/content/postcards.ts    明信片抬头按语言切换
        scripts/seal.ts                  加本地缓存兜底（可离线刻章）

测试  src/profile/folio.test.ts         primary 改为 zh
      src/book/content/grid.test.ts      论文卡无照片时的网格同一性
      src/paper/typeset.test.ts         新履历的角色行 / 1.9 倍页数上限
      src/print/seal.test.ts            新名章「语墨之印」（罗无篆体形）

新增  public/papers/AI眼镜社交边界.docx   学年论文全文（与原文件校验和一致）
      src/profile/schema.ts                Postcard 加 href 字段（论文的全文链接）
      src/app/AlbumDetail.tsx              论文详情视图的「全文」链接行
      scripts/seal.ts                      某个字没有篆体形时，改用它能刻的那几个字去刻

清理  删掉上游示例人物的全部文字（49 处，注释与测试夹具）
      src/print/seal.test.ts            夹具换成中性的「名字 / Ming Zi」
      src/fonts/fonts.test.ts           同上
      src/book/binder.test.ts           同上（Lin Wen / Design engineer / Shanghai → Ming Zi / Sample role）
      src/paper/typeset.test.ts         同上（140 ms → 38 ms 等演示文案）
      src/print/kinsoku.test.ts         同上（Paperplane Labs / 会动的纸）
      src/fonts/index.ts                5 处注释里的「林文」
      src/app/Shell.tsx  app.css  book/liner.ts  print/seal.ts
      src/bag/objects/card.ts  pouch.ts  scripts/harness/bag-fonts.tsx
      public/photos/                    删除 12 张上游日本旅行照；CREDITS.md 改写成放你自己照片的模板
      README.md  README.zh-CN.md  docs/DESIGN.md  prompts/*  相应说明同步更新
```

---

## 附：验证记录

```
bun run typecheck   ✓ 无错误
bun test src        ✓ 355 pass / 0 fail（25 个测试文件，69650 次断言）
bun run build       ✓ 3.3 s → dist/
截图                ✓ 1440×900 / 1280×720 / 390×844，控制台零报错
```

**已实机验证的效果**：暖玫瑰灰的房间、右上窗口的低角度落日、窗框与枝条的影子跨过桌面；课程作业册是桃粉色皮面活页夹，32 张作业卡按课程号分组成八组由浅到深的色带；论文册是樱花粉布面夹，十二张卡面各是一片程序生成的黄昏天空；履历夹是臙脂红磨砂封，中文印「明信片」抬头，摘要手写体写在背面。
