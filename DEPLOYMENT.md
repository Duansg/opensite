# Cloudflare 自动部署

本项目是 Astro 静态博客，构建产物为 `dist/`。Pages 与 Workers Static Assets 均可托管，不需要 SSR adapter、数据库或常驻进程。选择下列一个生产部署入口即可。

## 推荐：Cloudflare Pages 原生 GitHub 集成

1. 在 [Cloudflare 控制台](https://dash.cloudflare.com/)打开 **Workers & Pages → Create application → Pages → Import an existing Git repository**（界面文案可能随版本变化）。
2. 连接 GitHub，选择 **Duansg/opensite**。
3. 设置：

| 字段                   | 值                                                     |
| ---------------------- | ------------------------------------------------------ |
| Project name           | `opensite`（若全局名称已占用，以平台实际分配域名为准） |
| Production branch      | `main`                                                 |
| Framework preset       | `Astro`                                                |
| Build command          | `npm run build`                                        |
| Build output directory | `dist`                                                 |
| Root directory         | 仓库根目录                                             |
| Environment variable   | `NODE_VERSION=26.13.0`                                 |
| Environment variable   | `SITE_URL=https://实际分配的域名`                      |

4. 首次部署后，检查首页、正文、`/rss.xml` 与不存在路径的 404。
5. 此后每次 `git push origin main`，Cloudflare 会自动拉取仓库、安装依赖、构建并部署。PR 可获得 Pages Preview。

仓库内的 GitHub Actions 负责类型检查、构建、链接与 RSS 验证；原生 Git 部署不需要向 GitHub 提供 Cloudflare token。

## 可选：GitHub Actions 部署 Pages

适合希望「检查通过后才上传」的流程。请不要同时开启上面的原生 Git 自动部署，避免重复发布。

1. 本地运行 `npx wrangler login`，随后创建 Direct Upload 项目：

```sh
npx wrangler pages project create opensite --production-branch main
```

2. 在 GitHub 仓库 **Settings → Secrets and variables → Actions** 设置：

| 类型     | 名称                       | 内容                                     |
| -------- | -------------------------- | ---------------------------------------- |
| Secret   | `CLOUDFLARE_API_TOKEN`     | 仅目标 Cloudflare 账户的 Pages Edit 权限 |
| Secret   | `CLOUDFLARE_ACCOUNT_ID`    | Cloudflare Account ID                    |
| Variable | `CLOUDFLARE_DEPLOY_TARGET` | `pages`                                  |
| Variable | `SITE_URL`                 | 真实生产站点完整 URL                     |

3. 推送 `main`，或手动运行 **Check, build and deploy** 工作流。验证通过后自动上传 `dist/`。

注意：Pages 的 Direct Upload 项目与 Git 集成项目有不同的创建方式，不应假设以后可以直接切换项目类型。

## 可选：Cloudflare Workers Builds

如果「Worker 构建部署」指 Workers 而非 Pages，可使用本仓库 `wrangler.worker.jsonc`，依然完全静态：

1. 在 Cloudflare 创建 Workers 应用并连接 **Duansg/opensite**。
2. 生产分支 `main`，构建命令 `npm run build`，部署命令 `npx wrangler deploy --config wrangler.worker.jsonc`。
3. 对非生产分支版本上传命令使用 `npx wrangler versions upload --config wrangler.worker.jsonc`（若启用预览构建）。
4. 设置 `NODE_VERSION=26.13.0` 与 `SITE_URL=https://实际的workers域名或自定义域名`。
5. 此后每次推送，Workers Builds 自动构建与发布。

也可以通过同一个 GitHub Actions 工作流发布 Workers：将 `CLOUDFLARE_DEPLOY_TARGET` 设为 `workers`，token 使用目标账户的 Workers Scripts Edit 权限。不要同时启用 Workers Builds 与 Actions 发布。

## 本地命令部署

```sh
npx wrangler login
npm run deploy:pages
# 或
npm run deploy:worker
```

`wrangler.jsonc` 属于 Pages；Worker 命令必须显式使用 `--config wrangler.worker.jsonc`。两者不混用。

## 绑定自定义域名

在 Cloudflare 项目的 Custom domains 添加域名，按控制台提示配置 DNS。然后将构建环境的 `SITE_URL` 改为该域名并重新构建，使 canonical、RSS、sitemap、Open Graph 一致。不要将 API token、OAuth token 或账户凭据提交到仓库。

## 状态说明

配置文件本身不代表已部署。只有在 Cloudflare 账户授权、项目创建、首次部署成功并拿到实际 URL 后，才算完成生产部署。`https://opensite.pages.dev` 是默认配置值，不能在未验证时当作已上线地址。

## 官方资料

- [Astro → Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Workers 静态 Astro 配置](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)
