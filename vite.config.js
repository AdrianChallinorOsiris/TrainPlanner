import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/** Proxy to local Bastet (8080); same-origin paths in the app avoid browser CORS. */
const bastetProxy = {
  '/evolve': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
  '/roadmap': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
  '/journal': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['ra', '192.168.1.191'],
    proxy: bastetProxy,
  },
  preview: {
    proxy: bastetProxy,
  },
})
