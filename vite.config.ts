import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // loadEnv 会合并 .env / .env.local 及部署平台注入的 process.env
  const env = loadEnv(mode, process.cwd(), '')

  const port = parseInt(env.VITE_PORT || '5173', 10)
  // 'true' / 'false' 字符串 → 布尔值，也支持直接填 IP
  const hostRaw = env.VITE_HOST ?? 'true'
  const host = hostRaw === 'false' ? false : hostRaw === 'true' ? true : hostRaw

  return {
    plugins: [react()],
    server: {
      host,
      port,
    },
    preview: {
      host,
      port,
    },
    build: {
      outDir: 'dist',
    },
  }
})
