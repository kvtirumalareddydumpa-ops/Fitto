import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  }, 
  server: {
    allowedHosts: ['.app.github.dev'], // allow the Codespaces URL
    proxy: {
      // /api/exercises -> http://localhost:5123/exercises
      '/api': {
        target: 'http://localhost:5283',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})