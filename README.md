# Toolbox Web

在线开发者工具集合，纯浏览器端运行，数据不上传。

## 功能

| 工具 | 说明 |
|------|------|
| URL 编解码 | `encodeURIComponent` / `decodeURIComponent` / `encodeURI` / `decodeURI` |
| Mermaid 可视化 | 实时渲染流程图、时序图、甘特图等，支持缩放平移、下载 SVG |
| Base64 转图片 | 图片拖拽上传转 Base64，Base64 粘贴预览/下载 |
| Base64 编解码 | 文本 Base64 互转，完整 UTF-8 支持 |
| 时间戳转换 | 实时时钟，Unix 时间戳 ↔ 日期互转，支持秒/毫秒 |
| Cron 表达式 | 校验表达式、生成中文描述、计算下 5 次执行时间 |

## 主题

内置 6 套主题，侧边栏底部一键切换，自动持久化到 localStorage：

- 日间模式、浅色蓝、浅色绿（浅色）
- 夜间模式、午夜紫、暖阳橙（深色）

## 本地开发

```bash
npm install      # 安装依赖
npm run dev      # 开发服务器（HMR）
npm run build    # 生产构建（输出到 dist/）
npm run preview  # 预览生产构建
```

### 端口与主机配置

通过 `.env` 文件配置开发/预览服务器的端口和监听地址：

```bash
cp .env.example .env   # 复制示例配置
```

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_PORT` | `5173` | 开发/预览服务器端口 |
| `VITE_HOST` | `true` | `true` = 监听 `0.0.0.0`（允许远程访问）；`false` = 仅 `localhost`；也可直接填 IP |

配置后可访问：
- `http://localhost:<端口>`
- `http://127.0.0.1:<端口>`
- `http://<你的局域网IP>:<端口>`（需 `VITE_HOST=true`）

> 本地开发时 Auth 自动放行（未配置环境变量时不触发鉴权）。

## 部署

> EdgeOne Pages 部署需要自购域名并完成 ICP 备案，流程较繁琐且存在域名成本，故不再推荐。推荐使用 Vercel 部署，免费额度充足。

### Vercel

> 免费额度充足，超额自动暂停不扣费。详见：[Vercel Hobby Plan](https://vercel.com/docs/plans/hobby)。

#### 1. 安装 Vercel CLI（可选）

```bash
npm i -g vercel
```

也可以通过 [Vercel 控制台](https://vercel.com/new) 直接导入 Git 仓库。

#### 2. 部署

**方式一：Git 导入（推荐）**

1. 访问 [Vercel New Project](https://vercel.com/new) → 导入 GitHub 仓库
2. 构建配置自动识别（`vercel.json` 已提供）
3. 点击 **Deploy**

**方式二：CLI 部署**

```bash
vercel --prod
```

#### 3. 配置环境变量（可选）

访问控制（Auth）为**可选**功能，建议生产环境开启。配置了 `AUTH_USERNAME` 和 `AUTH_PASSWORD` 后，访问站点需输入用户名密码登录。

如**不开启**，跳过此步即可——未配置环境变量时 Auth 自动放行，访客无需登录直接进入。

Vercel 控制台 → 项目 → **Settings** → **Environment Variables** → 添加：

| 变量名 | 值 |
|--------|-----|
| `AUTH_USERNAME` | 你的用户名 |
| `AUTH_PASSWORD` | 你的密码 |

保存后 **Redeploy** 使环境变量生效。

#### 4. 预览部署

推送到非主分支会自动创建预览部署，预览环境自动跳过鉴权（`VERCEL_ENV !== 'production'`）。

## 搜索引擎收录（可选）

> 此为可选功能，不配置不影响站点正常使用。SEO 相关工作仅对希望站点被 Google 等搜索引擎收录的场景有意义。

### 1. 提交到 Google Search Console

1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 资源类型选择 **「网域」**，输入你的 Vercel 域名（如 `toolbox-web-eta.vercel.app`）
3. 验证方式选择 **「HTML 标记」** — 项目 `index.html` 的 `<head>` 中已内置了 verification meta 标签
4. 点击 **「验证」** 完成所有权认证
5. 验证通过后，在左侧菜单 **「Sitemaps」** 提交 `sitemap.xml`
6. 在 **「网址检查」** 中手动输入首页和各工具页面的 URL 触发索引

### 2. SEO 实现说明

项目已内置基础的搜索引擎优化：

| 优化项 | 说明 |
|--------|------|
| 每页独立标题与描述 | `src/hooks/useSEO.ts` 在每个页面组件渲染时动态设置 `<title>` 和 `<meta name="description">` |
| robots.txt | `public/robots.txt` — 允许所有爬虫抓取 |
| sitemap.xml | `public/sitemap.xml` — 列出所有工具页面路径 |
| Google 站点验证 | `index.html` 中已添加 `google-site-verification` meta 标签 |

### 3. 注意

- 项目当前**未启用**访问认证（`AUTH_USERNAME` / `AUTH_PASSWORD` 未配置），Googlebot 可直接抓取
- 若将来开启认证，Googlebot 会被登录页拦截导致无法收录。届时需在边缘函数 `api/_gateway.js` 中添加爬虫 User-Agent 白名单绕过认证

## 访问控制（Auth）机制

边缘函数 `api/_gateway.js`（Vercel）实现了自定义登录页 + Cookie 鉴权，并做了优化以减少边缘函数调用次数：

```
用户访问
  │
  ├─ 请求静态资源（.js/.css/.png/...）
  │    └─ 直接放行，不触发 auth
  │
  ├─ 请求 HTML 页面，带有效 Cookie
  │    └─ 直接放行（Cookie 在有效期内）
  │
  ├─ POST /api/auth/login（提交登录表单）
  │    └─ 校验通过 → 种 Cookie → 302 跳回原页面
  │    └─ 校验失败 → 返回登录页 + 错误提示
  │
  └─ 请求 HTML 页面，无 Cookie / Cookie 过期
       └─ 返回自定义登录页（带「记住我」选项）
            ├─ 勾选「记住我」→ Cookie 有效期 7 天
            └─ 不勾选 → Session Cookie（关闭浏览器失效）
```

**Cookie 策略**：

| 场景 | Cookie 类型 | 有效期 |
|------|------------|--------|
| 勾选「记住我」 | 持久 Cookie | 7 天 |
| 不勾选 | Session Cookie | 关闭浏览器失效 |

**优化效果**：静态资源完全不拦截，HTML 页面请求在 Cookie 有效期内只做轻量校验，只有首次访问需要完整验证。

### 在本地验证 Auth

边缘函数只在部署平台运行时生效，本地 `npm run dev` / `npm run preview` 不会触发。

验证方式：部署到 Vercel → 配置环境变量 → 访问域名。

## 技术栈

| 层面 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS 3（CSS 变量主题系统） |
| 图表渲染 | mermaid.js 11 |
| Cron 解析 | cron-parser 5 |
| 路由 | react-router-dom 7 |
| 部署 | Vercel |
| 认证 | 边缘函数自定义登录页 + Cookie（支持「记住我」） |

## 项目结构

```
toolbox-web/
├── src/
│   ├── components/
│   │   └── ui.tsx                  # 公共 UI 组件
│   ├── contexts/
│   │   └── ThemeContext.tsx        # 主题状态管理 + 持久化
│   ├── hooks/
│   │   └── useSEO.ts              # 页面标题和 meta 描述管理
│   ├── pages/
│   │   ├── Home.tsx                # 首页
│   │   ├── UrlCoder.tsx            # URL 编解码
│   │   ├── MermaidViewer.tsx       # Mermaid 可视化
│   │   ├── Base64Image.tsx         # Base64 转图片
│   │   ├── Base64Coder.tsx         # Base64 编解码
│   │   ├── TimestampConverter.tsx   # 时间戳转换
│   │   └── CronParser.tsx          # Cron 表达式
│   ├── App.tsx                     # 主布局 + 路由 + KeepAlive
│   ├── main.tsx                    # 入口
│   └── index.css                   # 全局样式 + 主题 CSS 变量
├── api/
│   └── _gateway.js                  # Vercel Edge Function：鉴权网关
├── vercel.json                     # Vercel 构建配置
├── public/
│   ├── favicon.svg
│   ├── robots.txt              # 爬虫规则
│   └── sitemap.xml             # 站点地图（用于 Google 索引）
├── tailwind.config.js              # Tailwind 配置（gray/brand → CSS 变量）
├── vite.config.ts                  # Vite 配置（host: true 允许远程访问）
└── package.json
```

## 安全说明

| 安全点 | 说明 |
|--------|------|
| GitHub 公开仓库 | 密码不进代码，仅引用变量名 `env.AUTH_PASSWORD` |
| 环境变量存储 | Vercel 控制台加密存储，仅运行时注入 |
| Cookie 安全 | `HttpOnly` + `SameSite=Lax`，不可被 JS 读取 |
| HTTPS | Vercel 默认提供 SSL 证书 |
| `.gitignore` | 已排除 `.env`、`node_modules`、`dist` 等 |

## License

MIT
