# OPEN.SITE

Astro 静态个人博客。采用新野兽派 × 像素艺术：蓝紫网格、窄体巨型标题、黑色直角硬阴影、像素人物与轻量交互。

## 本地运行

Node.js 26（本地版本文件和 CI 固定为 26.13.0），Astro 7.4.5。

使用 nvm 时，在项目目录安装并切换到 `.nvmrc` 指定的版本：

```sh
nvm install
nvm use
```

```sh
npm ci
npm run dev
```

打开 `http://127.0.0.1:4321/`。

如果系统 Node 版本较旧，可使用临时运行时，不修改全局 Node：

```sh
npx --yes --package=node@26.13.0 -c 'npm run dev'
```

在 IDEA 中运行 npm 脚本时，项目的 Node runtime 也应选择 Node 26，并使用对应的 npm。版本文件不会覆盖运行配置中手动指定的旧解释器路径。

```sh
npm run verify  # 类型检查 + 翻译参数/单复数检查 + 静态构建 + 链接/RSS/搜索/SEO 语言检查
npm run preview # 预览构建产物
npm run smoke   # 开发服务启动后，检查页面、搜索、RSS 与 HTTP 404
npm run dev:stop
```

代码统一使用 Prettier 和 Astro 插件格式化：

```sh
npm run format
npm run format:check
```

## 写文章

```sh
npm run new:post -- my-first-post "我的第一篇文章"
```

在 `src/content/posts/` 编辑生成的 Markdown：

```yaml
---
title: '我的第一篇文章'
description: '文章简介。'
date: 2026-11-05
category: 'engineering'
lang: 'zh-CN'
tags: ['Astro', '构建笔记']
cover: 'computer'
featured: false
draft: false
---
```

- 分类标识：engineering（工程）/ design（设计）/ thoughts（随笔）/ toolbox（工具）。旧文章中的中文分类仍可读取，旧中文分类筛选链接也继续有效。
- 可选 `lang` 标记文章原文语言（例如 `zh-CN`、`en`）；省略时沿用界面语言。创建文章脚本默认生成中文草稿，英文文章请相应修改 `lang` 和正文。
- 内置像素封面：computer / planet / window / coffee / blocks / terminal。
- `featured: true` 用于首页精选；有多个时选择最新一篇。
- `draft: true` 和未来日期文章不会出现在站点、RSS、标签页或搜索中。草稿默认不生成公开预览。
- 定时文章需要在到达日期后触发一次构建，不会由静态站点自行发布。
- 可选 `updated` 表示最后更新日期。
- 中文／英文全文搜索、分类筛选、标签、按年归档、目录、阅读进度、阅读时长、相邻文章、RSS 自动生成。
- 仓库内的六篇内容是排版示例，通过 `demo: true` 在正文标注；正式文章省略该字段即可。

## 配置与结构

修改 `src/config.ts` 中的站名、作者、GitHub 链接和界面语言。站点介绍、首页、关于页及其他界面文案在 `src/i18n/` 中按语言管理。生产构建设置 `SITE_URL`，使 RSS、canonical 和 sitemap 指向最终域名。

### 界面国际化

在 `src/config.ts` 选择语言：

```ts
export const locale: Locale = 'zh-CN'; // 简体中文；改为 'en' 使用英文
```

运行 `npm run verify` 后重新部署，即可切换整个站点的界面语言。每次构建生成一种语言，页面路径保持不变。开发时修改配置也会更新页面。

- `src/i18n/zh-CN.ts`：中文界面文案，同时定义词典结构。
- `src/i18n/en.ts`：英文界面文案，通过 `satisfies Messages` 检查字段是否完整。
- `src/i18n/index.ts`：统一选择当前词典，页面通过 `ui.nav.home.label` 等字段读取。
- `src/i18n/format.ts`：完整句子的参数替换，以及数字和单复数格式化；日期使用当前语言格式，并固定 UTC 以保持文章日期稳定。
- 搜索状态、菜单、复制链接、无障碍标签、HTML/分享元信息和 RSS 语言同步切换；浏览器只接收当前语言所需的交互文案。
- 分类使用固定标识参与内容校验、筛选、URL 和配色，显示名称由词典提供。

新增语言时，复制一份词典并保留 `satisfies Messages`，在 `types.ts` 的 `Locale` 和 `index.ts` 的 `dictionaries` 中注册，再修改配置。包含数量的文案支持 `Intl.PluralRules`；中英文现有词典提供 `one`、`other`，更多复数规则可在词典中补充。

界面语言不会翻译文章的标题、摘要、正文和自由标签。现有示例文章保留中文并显式标记 `lang: 'zh-CN'`。如果需要多种语言的文章同时在线，还需要单独增加内容翻译和语言路由。

```text
src/
  components/        导航、搜索、像素插画、文章卡片、侧栏
  content/posts/     Markdown 文章
  layouts/          页面外壳、SEO
  i18n/             中英文词典与文案格式化
  lib/              内容查询、时间与链接
  pages/            首页、文章、归档、关于、标签、404、RSS、搜索索引
  scripts/          搜索与像素交互
  styles/           同一套响应式设计变量与样式
scripts/            创建文章、验证静态构建、检查本地运行状态
public/             自托管图形、Cloudflare 响应头
.github/workflows/  自动检查与可选部署
```

网页交互使用原生 TypeScript，没有客户端 UI 框架。字体随构建自托管。移动端折叠菜单、单列排版，支持键盘操作与减少动态效果偏好。

## 发布

详细步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)。推荐 Cloudflare Pages 原生连接此 GitHub 仓库：

```text
编辑 Markdown → git push origin main → Cloudflare 构建 → 静态站上线
```

构建命令 `npm run build`，输出目录 `dist`。同时提供独立 Workers 静态配置和可选 GitHub Actions 自动部署。`SITE_URL` 默认值不代表已上线。

完整视觉规范见 [DESIGN.md](./DESIGN.md)。
