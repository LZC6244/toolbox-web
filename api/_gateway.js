/**
 * Vercel Edge Function - Auth Gateway (Custom Login Page)
 *
 * 环境变量（在 Vercel 控制台 Settings → Environment Variables 配置）:
 *   AUTH_USERNAME - 登录用户名
 *   AUTH_PASSWORD - 登录密码
 */

const REMEMBER_MAX_AGE = 7 * 24 * 60 * 60
const COOKIE_NAME = '_tb_auth'
const FLAG_COOKIE_NAME = '_tb_auth_on'

function makeToken(username, password) {
  const raw = `${username}:${password}:${REMEMBER_MAX_AGE}`
  return btoa(raw)
}

function verifyToken(token, username, password) {
  try {
    const decoded = atob(token)
    return decoded === `${username}:${password}:${REMEMBER_MAX_AGE}`
  } catch {
    return false
  }
}

function parseCookies(cookieHeader) {
  const cookies = {}
  if (!cookieHeader) return cookies
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx > 0) {
      cookies[part.substring(0, idx).trim()] = part.substring(idx + 1).trim()
    }
  }
  return cookies
}

async function parseForm(request) {
  const formData = await request.formData()
  return {
    username: (formData.get('username') || '').toString(),
    password: (formData.get('password') || '').toString(),
    remember: formData.get('remember') === 'on',
    redirect: (formData.get('redirect') || '/').toString(),
  }
}

function getLoginPage(redirect, error) {
  const errorHtml = error
    ? `<div class="error">${error}</div>`
    : ''
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Toolbox - 登录</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  background:#0f172a;color:#e2e8f0;
  display:flex;align-items:center;justify-content:center;
  min-height:100vh;
}
.login-card{
  background:#1e293b;border:1px solid #334155;
  border-radius:16px;padding:40px;width:100%;max-width:380px;
  box-shadow:0 25px 50px -12px rgba(0,0,0,.5);
}
.login-header{text-align:center;margin-bottom:32px}
.login-header .logo{
  display:inline-flex;align-items:center;justify-content:center;
  width:56px;height:56px;border-radius:12px;
  background:#4f46e5;font-size:28px;font-weight:700;color:#fff;
  margin-bottom:16px;
}
.login-header h1{font-size:22px;font-weight:700;margin-bottom:4px}
.login-header p{font-size:13px;color:#94a3b8}
.form-group{margin-bottom:20px}
.form-group label{display:block;font-size:14px;font-weight:500;color:#cbd5e1;margin-bottom:6px}
.form-group input[type="text"],
.form-group input[type="password"]{
  width:100%;padding:10px 14px;font-size:14px;
  background:#0f172a;border:1px solid #334155;
  border-radius:8px;color:#e2e8f0;outline:none;
  transition:border-color .15s;
}
.form-group input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15)}
.remember-group{
  display:flex;align-items:center;gap:8px;margin-bottom:24px;
  cursor:pointer;user-select:none;
}
.remember-group input{
  width:16px;height:16px;accent-color:#6366f1;cursor:pointer;
}
.remember-group label{font-size:13px;color:#94a3b8;cursor:pointer}
.btn-login{
  width:100%;padding:12px;font-size:15px;font-weight:600;
  background:#4f46e5;color:#fff;border:none;border-radius:8px;
  cursor:pointer;transition:background .15s;
}
.btn-login:hover{background:#4338ca}
.btn-login:active{transform:scale(.98)}
.error{
  background:#7f1d1d33;border:1px solid #991b1b;
  color:#fca5a5;padding:10px 14px;border-radius:8px;
  font-size:13px;margin-bottom:20px;
}
</style>
</head>
<body>
<div class="login-card">
  <div class="login-header">
    <div class="logo">T</div>
    <h1>Toolbox</h1>
    <p>在线工具集合</p>
  </div>
  ${errorHtml}
  <form method="POST" action="/api/auth/login">
    <input type="hidden" name="redirect" value="${redirect}">
    <div class="form-group">
      <label for="username">用户名</label>
      <input type="text" id="username" name="username" autocomplete="username" autofocus required>
    </div>
    <div class="form-group">
      <label for="password">密码</label>
      <input type="password" id="password" name="password" autocomplete="current-password" required>
    </div>
    <div class="remember-group">
      <input type="checkbox" id="remember" name="remember">
      <label for="remember">记住我（7 天）</label>
    </div>
    <button type="submit" class="btn-login">登录</button>
  </form>
</div>
</body>
</html>`
}

function buildSetCookie(name, value, remember) {
  const parts = [`${name}=${value}`, 'Path=/', 'SameSite=Lax']
  if (name === COOKIE_NAME) parts.push('HttpOnly')
  if (remember) parts.push(`Max-Age=${REMEMBER_MAX_AGE}`)
  return parts.join('; ')
}

function buildClearCookie(name) {
  return `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

async function serveStaticFile(request, originalPath) {
  // 获取实际静态文件内容（带扩展名不会递归触发 rewrite）
  const lastSeg = (originalPath.split('/').pop() || '')
  const hasExt = lastSeg.includes('.')
  const targetUrl = hasExt
    ? new URL(originalPath, request.url)
    : new URL('/index.html', request.url)

  const res = await fetch(targetUrl)
  if (!res.ok) {
    return new Response('Not Found', { status: 404 })
  }
  return res
}

export default async function handler(request) {
  const USERNAME = process.env.AUTH_USERNAME || ''
  const PASSWORD = process.env.AUTH_PASSWORD || ''

  const url = new URL(request.url)
  // rewrite 后的 url.pathname 是 /api/_gateway，真正的原始路径在 __path 参数里
  const originalPath = url.searchParams.get('__path') || url.pathname

  // === 登录接口（POST）===
  if (originalPath === '/api/auth/login' && request.method === 'POST') {
    const form = await parseForm(request)

    // 未配置鉴权则直接重定向
    if (!USERNAME || !PASSWORD) {
      const safeRedirect = form.redirect.startsWith('/') ? form.redirect : '/'
      return Response.redirect(new URL(safeRedirect, request.url), 302)
    }

    if (form.username === USERNAME && form.password === PASSWORD) {
      const token = makeToken(USERNAME, PASSWORD)
      const safeRedirect = form.redirect.startsWith('/') ? form.redirect : '/'
      const headers = new Headers()
      headers.append('Set-Cookie', buildSetCookie(COOKIE_NAME, token, form.remember))
      headers.append('Set-Cookie', buildSetCookie(FLAG_COOKIE_NAME, '1', form.remember))
      headers.set('Location', safeRedirect)
      return new Response(null, { status: 302, headers })
    }

    return new Response(getLoginPage(form.redirect, '用户名或密码错误'), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // === 登出接口 ===
  if (originalPath === '/api/auth/logout') {
    const headers = new Headers()
    headers.append('Set-Cookie', buildClearCookie(COOKIE_NAME))
    headers.append('Set-Cookie', buildClearCookie(FLAG_COOKIE_NAME))
    headers.set('Location', '/')
    return new Response(null, { status: 302, headers })
  }

  // === 未配置鉴权 → 直接服务静态文件 ===
  if (!USERNAME || !PASSWORD) {
    return serveStaticFile(request, originalPath)
  }

  // === 预览部署 → 跳过鉴权 ===
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return serveStaticFile(request, originalPath)
  }

  // === 检查 Cookie ===
  const cookies = parseCookies(request.headers.get('cookie'))
  const existingToken = cookies[COOKIE_NAME]
  if (existingToken && verifyToken(existingToken, USERNAME, PASSWORD)) {
    return serveStaticFile(request, originalPath)
  }

  // === 未认证 → 返回登录页 ===
  return new Response(getLoginPage(originalPath, ''), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
