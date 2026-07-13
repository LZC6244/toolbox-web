import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'

// 1. 清理输出目录
rmSync('.vercel/output', { recursive: true, force: true })
mkdirSync('.vercel/output/static', { recursive: true })
mkdirSync('.vercel/output/functions/api/_gateway.func', { recursive: true })

// 2. Vite 构建
execSync('npx vite build', { stdio: 'inherit' })

// 3. 复制静态文件
cpSync('dist', '.vercel/output/static', { recursive: true })

// 4. 复制 Edge Function
cpSync('api/_gateway.js', '.vercel/output/functions/api/_gateway.func/index.js')

// 5. Edge Function 配置
writeFileSync('.vercel/output/functions/api/_gateway.func/.vc-config.json', JSON.stringify({
  runtime: 'edge',
  entrypoint: 'index.js',
}, null, 2))

// 6. 路由配置
writeFileSync('.vercel/output/config.json', JSON.stringify({
  version: 3,
  routes: [
    { src: '^/api/auth(?:/(.*))$', dest: '/api/_gateway?__path=/api/auth/$1', check: true },
    { src: '^(?:/([^.]*))$', dest: '/api/_gateway?__path=/$1', check: true },
    { handle: 'filesystem' },
  ],
}, null, 2))

console.log('✅ Build complete → .vercel/output/')
