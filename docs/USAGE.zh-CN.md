# 怎么用这个博客

> **内容的说明书在文件夹里，更白话、带步骤：**
> `~/Desktop/学习/课程/新媒体交互设计/Assignment2/README.md`
>
> 想知道「怎么加一篇论文」「怎么加一门课」，看那份。这份是改代码时用的。

---

## 一、三层东西

```
~/Desktop/学习/课程/新媒体交互设计/Assignment2/   ← 内容（YAML + Markdown + 图片）
        ↓ bun run sync
profile/generated.ts                            ← 生成的内容快照（别手改，会进 git）
profile/content.ts                              ← 只剩类型和一层薄包装
        ↓ bun run build
dist/ → pages-repo/Assignment2/                 ← 上线
```

改 `Assignment2/` 里的东西，跑一条命令，站点跟着变。**不用碰 `src/`。**

`generated.ts` 提交进仓库 —— 所以构建不依赖那个桌面文件夹存在。

---

## 二、一条命令上线

```bash
cd /Users/luoyumo/WorkBuddy/2026-11-09-14-05-19/duskfolio
bun run publish
```

五步，任何一步失败都停：

1. **sync** —— 读文件夹，写 `generated.ts`，复制本地图片，转 Markdown 正文
2. **test** —— 364 个测试（形状、字数、排版约束）
3. **build**
4. **推源码**（AGPL 要求公开源码）
5. **发布** → https://hualala25.github.io/Assignment2/

### 只想本地看

```bash
bun run sync      # 文件夹 → 内容（改 YAML / Markdown 后必须先跑这个）
bun run dev       # http://localhost:5188
```

YAML 和 Markdown 都是**构建期**读的，不是运行时 —— 改完必须 `sync` 一次。

---

## 三、sync 会拦住什么

这些如果不拦，出错是**静默的**（页面看着正常，内容被切掉）：

| 检查 | 为什么 |
|---|---|
| 每门课 4 张卡 | 册子每面 2×4，少一张有空位 |
| 4 个颜色、明度递减、全站不重复 | 视觉上是一道色带，顺序错就乱 |
| 课程号 `[A-Z]{3}\d{3}` | 卡面 85.6 mm，长标题压边 |
| 摘要 ≤ 7 行（中文 ≤82 字 / 英文 ≤157 字符） | 明信片背面就那么大，**超了直接截断，不报错** |
| `doc:` 指向的正文存在 | 否则点开是空的 |
| 论文 id 不重复 | 否则互相覆盖 |

`bun run sync` 一次列出所有问题，带位置。

---

## 四、正文：两种写法

### Markdown（推荐）

放在论文或课程文件夹里，叫 `正文.md`：

```markdown
# 标题

> 题记（可选，会排成副标题）

## 一、引言

段落。

![图1 说明](图片文件名.png)

| 表头 | 表头 |
|---|---|
| 值 | 值 |
```

支持：`#` 标题（一~三级）、段落、`![说明](图)`、表格、`>` 引用、列表。
不支持：行内粗体斜体（去掉标记留下字）、脚注、HTML。
刻意的 —— 页面上是一篇论文的排版，不是网页编辑器。

图片写文件名就行：`images/` 里有同名的用站点路径，否则当图床文件名。

### docx

```bash
bun run docx ~/Desktop/…/论文.docx <名字> [--bed <图前缀>] [--images <目录>]
```

写出 `profile/documents/<名字>.ts`。插图用 `--bed xxx` 指向图床的 `xxx1.webp`、
`xxx2.webp`…；用 `--images public/images` 则写进站点。

> 已经用 docx 转好的正文（`ai-glasses.ts`、`heat-mirror.ts`）继续有效，
> 两种写法可以混用。

---

## 五、图片

两种都行，**不用传图床也能用**：

- 丢进 `Assignment2/images/` —— sync 复制到 `public/images/`，YAML 里写文件名
- 或放图床 `hualala25/images`（PicGo），YAML 里同样只写文件名

**别用 `raw.githubusercontent.com`**。实测国内加载不了（DNS 污染 + 限流），而且
**静默失败** —— 卡位空着，控制台只说一句 CORS。站点走 Pages 镜像
`hualala25.github.io/images/`，同一个仓库。

规格：封面 1200–1600 px 宽、148 : 105；作业卡约 1 : 1.33。

---

## 六、加 / 减数量要改测试

页面上的数字自动变，**测试里的是写死的**：

| 常数 | 位置 | 含义 |
|---|---|---|
| `32` | `src/profile/sample.test.ts:27` | 作业卡总数 |
| `8` | `src/profile/sample.test.ts:57` | 课程数 |
| `12` | `src/profile/sample.test.ts:105-106` | 论文数 |

**替换**一篇（数量不变）不用动；**新增**要改。

---

## 七、排错

**页面空白 / 一直「正在打开册子」**
→ 先确认预览服务活着：`curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4173/`
→ 服务挂了就重开。本地正常网络 2–3 秒出来。

**改了内容但线上没变**
→ `publish` 最后说「发布目录没有变化」= 产物确实没变，缓存正常。
→ 否则等 2 分钟。GitHub Pages 队列偶尔卡住（`Deployment failed, try again later`），
   去 Actions 点 Re-run jobs，不是你的问题。

**图片不显示，控制台说 CORS**
→ 别查 CORS 头。带 `crossOrigin` 的图**因任何原因失败都报 CORS**。
→ 先确认文件名对，再确认 `https://hualala25.github.io/images/文件名` 能打开。

**`bun run sync` 报错**
→ 按它指的位置改。它列的每一条都是「不改会静默出错」的那种。

---

## 八、命令速查

```bash
bun run dev            # 本地开发（改代码即时刷新；改 YAML 要先 sync）
bun run sync           # 文件夹 → 内容，带校验
bun run publish        # 一条命令上线
bun run build          # 只构建
bun run preview        # 预览构建产物
bun test src           # 跑测试
bun run typecheck      # 类型检查
bun run docx <docx> <名字> [--bed <前缀>]   # docx → 正文
bun run seal <名字>    # 重刻小篆名章
bun scripts/export-content.ts               # 把内容反向导出成文件夹（一次性）
```
