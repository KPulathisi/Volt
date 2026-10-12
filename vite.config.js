import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import adminPlugin from './admin/vite-admin-plugin.js'

// base './' keeps asset paths relative, so the build works on GitHub Pages project URLs,
// Cloudflare Pages and Vercel without extra configuration.
export default defineConfig({
  base: './',
  plugins: [vue(), adminPlugin()],
  // three.js is loaded on demand in its own chunk
  build: { chunkSizeWarningLimit: 700 }
})
