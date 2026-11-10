# 怎么用这个博客

给你的操作手册。看完这一份，加文章、删文章、换图、上线都不用再问人。

> **2026-11-10 起：内容搬到了文件夹，不再改代码。**
>
> 现在的内容在：
> `~/Desktop/学习/课程/新媒体交互设计/Assignment2/`
>
> 那里有自己的 `README.md`，讲怎么加论文、加作业、传图。
> `profile/content.ts` 只剩类型和一层薄包装，真正的内容由 `bun run sync`
> 从 YAML 生成到 `profile/generated.ts`。
>
> **所以下面第三、四节（改 content.ts 的写法）已经过时**，看文件夹里的 README 就行。
> 第二、五、六、七、八节仍然有效（上线流程、图片规格、数量断言、字数上限、排错）。

---

## 一、先搞清楚三层东西

改了哪里，会影响到哪里：

```
profile/            ← 内容。你 99% 的时间只改这里
  content.ts            课程与论文的清单（中英共用一份骨架）
  zh.ts / en.ts         你的名字、简介、履历、袋里五件东西的文字
  documents/            docx 转出来的正文（自动生成，别手改）
  seal.ts               小篆名章（脚本生成，别手改）

src/                ← 页面本身的代码。改这里等于改设计，一般不用动

dist/               ← 构建产物。`bun run build` 生成，不要手改
pages-repo/Assignment2/   ← 上线用的那份，就是 dist 复制过去的
```

**一句话**：改 `profile/` → 构建 → 复制到 `pages-repo` → push。

---

## 二、改完怎么上线（一条命令）

```bash
cd /Users/luoyumo/WorkBuddy/2026-11-09-14-05-19/duskfolio
bun run publish
```

它依次做五件事，任何一步出错都停下，不会带着错上线：

1. **sync** —— 读文件夹里的 YAML，生成 `profile/generated.ts`，复制本地图片
2. **test** —— 364 个测试（形状、字数、排版约束）
3. **build** —— 构建
4. **推源码** —— AGPL 要求公开源码
5. **发布** —— 同步到 `pages-repo/Assignment2/` 并推送

推完约 2 分钟自动上线。

### 只想在本地看，先不上线

```bash
bun run sync        # 文件夹 → 站点内容
bun run dev         # 打开 http://localhost:5188，改代码即时刷新
```

注意：改 YAML 之后要**再跑一次 `bun run sync`**，`dev` 才会看到新内容
（YAML 是构建期读的，不是运行时）。

上线地址：**https://hualala25.github.io/Assignment2/**

> 源码也要备份的话，第 ③ 步之后在 `duskfolio/` 里也 `git add -A && git commit -m "..." && git push`。
> 不上传源码不影响网站，但 AGPL 要求源码公开，建议一起推。

---

## 三、加一篇论文

论文在 `profile/content.ts` 的 `PAPERS` 数组里（**第 124 行起**）。

现在是 **12 篇**，对应册子的两页（每页 2×3）。加减数量见第六节。

### 情况 A：只加一张卡（标题 + 摘要 + 颜色）

在数组末尾加一项，或者替换掉某个 `paper(n, ...)`：

```ts
{
  id: "p13",                                    // 必须是 p + 两位数，不能重
  label: {
    zh: "论文的标题",
    en: "The paper's title in English",
  },
  place: {
    zh: "发表于哪里",                            // 载体
    en: "Where it was published",
  },
  message: {
    zh: "摘要，最多 82 个字。",                   // ← 超了会被静默截断
    en: "Abstract, at most 157 characters.",     // ← 同上
  },
  date: "2026-11-10",                           // 可选；不写就不印邮戳日期
  color: "#e8b6c0",                             // 明信片正面那片天空的颜色
},
```

> **最省事的做法**：把现有的 `paper(13, "#xxxxxx")` 这一行换成上面这个对象。
> `paper(n, color)` 是占位函数，生成的是「论文13 / 待填：收录载体 / 占位摘要」。

### 情况 B：给论文加一张封面图（明信片正面）

先把图传到图床（见第五节），拿到文件名，然后加一行：

```ts
  src: "my-paper-cover.webp",     // 图床上的文件名，不是完整网址
```

### 情况 C：加全文（点开就在页面里读）

1. 把 docx 转成页面正文：

```bash
bun run docx ~/Desktop/学习/课程/学年论文/我的论文.docx my-paper --bed my-paper-fig
```

- 第一个参数：docx 路径
- 第二个参数：名字（会生成 `profile/documents/my-paper.ts`）
- `--bed <前缀>`：文档里的插图不写进站点，而是指向图床（`my-paper-fig1.webp`、`my-paper-fig2.webp`…）
- 如果图不想上图床，改用 `--images public/images`，会写进站点

2. 在 `PAPERS` 里那篇加上：

```ts
  doc: "my-paper",                                  // 对应 profile/documents/my-paper.ts
  href: { zh: "papers/我的论文.docx", en: "papers/我的论文.docx" },  // 可选：原文件下载
```

3. 要提供原文件下载的话，把 docx 拷进 `public/papers/`：

```bash
cp ~/Desktop/学习/课程/学年论文/我的论文.docx public/papers/
```

---

## 四、加一门课 / 一次作业

课程作业在 `profile/content.ts` 的 `COURSES` 数组里（**第 64 行起**）。

### 加一门课

**注意：一门课必须是 4 张作业卡**（册子每面 2×4，这是物理结构）。作业不够 4 次的，用占位补齐。

```ts
{
  code: "NME201",                    // 必须 3 个大写字母 + 3 位数字
  colors: ["#f8e2e6", "#f4d3da", "#efc2cc", "#e7aebc"],   // 4 个，由浅到深
  zh: {
    course: "传播学研究方法",
    cards: [
      { name: "作业一", note: "一句话说明这次作业做了什么。" },
      { name: "作业二", note: "……" },
      { name: "作业三", note: "……" },
      { name: "作业四", note: "……" },
    ],
  },
  en: {
    course: "Research Methods in Communication",
    cards: [
      { name: "Assignment 1", note: "One line on what it was." },
      { name: "Assignment 2", note: "…" },
      { name: "Assignment 3", note: "…" },
      { name: "Assignment 4", note: "…" },
    ],
  },
  // 可选：给某几张卡补上图和正文（按卡位，第 1 张对应 extra[0]）
  extra: [
    { src: "my-fig.webp", doc: "my-assignment" },
    undefined, undefined, undefined,
  ],
},
```

### 颜色有硬规矩

测试会检查这四条，不满足就红：

1. **4 个颜色互不相同**
2. **明度严格递减**（第 1 张最浅，第 4 张最深）
3. 所有卡片（全部 8 门课）的颜色**两两不重复**
4. 课程号匹配 `^[A-Z]{3}\d{3}$`

想省事就直接抄现成的色带，改一下色相：

```
粉  ["#f8e2e6", "#f4d3da", "#efc2cc", "#e7aebc"]
紫  ["#eae2f1", "#ded4e9", "#d0bedd", "#bda4d0"]
杏  ["#f9e4e0", "#f5d1ca", "#efc0b6", "#e4ab9f"]
蜜  ["#f7ead6", "#efdcc0", "#e6caa6", "#d8b78c"]
```

### 只改现有课的某一张作业

`COURSES[0]` 是「人工智能概论」，已经手写开了。改这张卡的名字和说明就行：

```ts
{ name: "热量镜策划案", note: "“热量镜”智能热量识别与饮食管理产品策划案（课程作业）。" },
```

---

## 五、图片怎么传（图床）

图片放在一个单独的仓库 `hualala25/images`，用 **PicGo** 上传。

1. 打开 PicGo，拖图进去
2. 它会把文件推到 `hualala25/images`，并复制一个链接给你，形如
   `https://raw.githubusercontent.com/hualala25/images/main/xxx.webp`
3. **你只需要文件名那一段**：`xxx.webp`

然后：

- 论文封面 → `PAPERS` 里的 `src: "xxx.webp"`
- 作业卡图 → `COURSES` 的 `extra[i].src: "xxx.webp"`
- 正文插图 → `bun run docx ... --bed xxx`（前缀）

> **别填完整网址**。填文件名就行，站点会自己拼地址。
>
> **也别用 raw.githubusercontent.com**。实测在国内加载不了（DNS 污染 + 限流），而且它
> **静默失败** —— 卡位就空着，控制台只说一句 CORS。站点已经改成走 Pages 镜像
> `hualala25.github.io/images/`，这是同一个仓库，内容一样，国内能访问。

**图片规格**（不太好会糊或变形）：

| 用途 | 尺寸 | 比例 |
|---|---|---|
| 论文封面（明信片正面） | 1200–1600 px 宽 | 148 : 105 |
| 作业卡 | 800–1200 px 宽 | 约 1 : 1.33 |
| 正文插图 | 1200–1600 px 宽 | 不限 |

格式用 webp 或 jpg，sRGB。

**不配图也好看**：没有 `src` 时，明信片正面会自己画一片黄昏天空，作业卡是纯色。

---

## 六、加 / 减数量（这一步有个坑）

**页面上的数字是自动的，测试里的数字是写死的。**

你把论文从 12 篇加到 13 篇，页面目录会自动显示「论文 13」（`countOf` 实时算），
但 `bun test src` 会红，因为测试里写死了 12。

所以要**同时改测试**：`src/profile/sample.test.ts`

| 常数 | 位置 | 含义 |
|---|---|---|
| `32` | 第 27 行 | 作业卡总数（8 门 × 4 张） |
| `8` | 第 57 行 | 课程数 |
| `12` | 第 105、106 行 | 论文数 |

改法就是改数字：

```ts
expect(cards.length).toBe(32);   →   expect(cards.length).toBe(36);   // 加了一门课
expect(COURSES.length).toBe(8);  →   expect(COURSES.length).toBe(9);
expect(PAPERS.length).toBe(12);  →   expect(PAPERS.length).toBe(13);  // 加了一篇论文
```

**更省事的办法**：如果不确定，先改内容，跑 `bun test src`，它会告诉你期望值和实际值差多少，
照着改就行。

### 删一篇论文

1. 从 `PAPERS` 里删掉那一项
2. 把测试里的 `12` 改成 `11`
3. 如果删掉的那篇有 `doc`，`profile/documents/` 里对应的文件可以留着（不影响），也可以删掉
4. 如果删掉的那篇有 `href`，`public/papers/` 里那份 docx 也可以删掉

### 删一门课

1. 从 `COURSES` 里删掉那一项
2. 测试里的 `32` 减 4、`8` 减 1
3. 注意：删掉后颜色带少一段，不会影响别的课

---

## 七、硬约束表（超了会怎样）

这些是排版引擎的物理限制，不是随便设的：

| 内容 | 上限 | 超了会怎样 |
|---|---|---|
| 论文摘要·中文 | **82 字** | 明信片背面第 7 行之后**被静默截断**，不报错 |
| 论文摘要·英文 | **157 字符** | 同上 |
| 论文标题·中文 | 约 30 字 | 邮戳弧排不下，会挤 |
| 作业卡名·中文 | **6 字** | 卡面排不下，会压到边 |
| 作业卡名·英文 | **20 字符** | 同上 |
| 履历组织名·英文 | **24 字符** | 排版引擎的 keep 语义失效，会拆行 |
| 履历组织名·中文 | **12 全角** | 同上 |

**摘要的字数怎么算**：中文一个字算 1，英文一个字母算 0.52。
65.4 mm 宽、5.6 mm 字、7 行 —— 大概就是中文 82 字 / 英文 157 字符。

`bun test src` 里有一条专门查这个（`lines(c.message) <= 7`），超了会指名道姓告诉你是哪一篇。

---

## 八、排错

**页面打开是空白 / 卡在「正在打开文件夹」**
→ 大概率是网络慢。本地 `bun run dev` 只需 2 秒；线上首次可能要几秒。
→ 硬刷新一次（Cmd + Shift + R），旧缓存可能还在。

**图片不显示，控制台说 CORS**
→ 别急着查 CORS 头。带 `crossOrigin` 的图片**因任何原因失败都报 CORS**（网络、DNS、超时）。
→ 先确认文件名对不对，再确认 `https://hualala25.github.io/images/你的文件名` 能打开。

**改了内容但线上没变**
→ 确认 `dist/` 已经复制到 `pages-repo/Assignment2/` 并 push 了。
→ 等 2 分钟。GitHub Pages 有缓存。
→ 偶尔 GitHub 的部署队列会卡住（报 `Deployment failed, try again later`），
   去 Actions 页面点 "Re-run jobs" 就好，不是你的问题。

**`bun test src` 红了**
→ 看报错里的期望值和实际值。多数是数量变了没改断言，或者字数超了。

**想撤销刚才的改动**
```bash
cd duskfolio && git checkout -- profile/content.ts     # 撤销单个文件
git log --oneline -5                                    # 看历史
git reset --hard HEAD~1                                 # 撤销上一次提交（慎用）
```

---

## 九、还记得要改的

这些地方现在还是占位，有空换成真的：

- `COURSES` 里第 2–8 门课全是「课程2…课程8 / 作业1…作业4」
- `PAPERS` 里第 2–12 篇全是「论文2…论文12 / 待填：收录载体」
- `zh.ts` / `en.ts` 里履历只有一段（公益广告大赛二等奖），技能和语言两行是示例
- `zh.ts` 里选题票还是「数字编辑创新大赛」，编号和「入围」是编的

---

## 附：常用命令速查

```bash
bun run dev            # 本地开发，改完自动刷新
bun run build          # 构建
bun run preview        # 预览构建产物（和线上一致）
bun test src           # 跑测试（内容形状、字数、排版约束）
bun run typecheck      # 类型检查
bun run docx <docx> <名字> [--bed <前缀>]   # docx 转正文
bun run seal <名字>    # 重刻小篆名章
```
