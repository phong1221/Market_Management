import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/products': 'http://localhost:8000',
      '/providers': 'http://localhost:8000',
      '/categories': 'http://localhost:8000',
      '/imports': 'http://localhost:8000',
      // Giữ cả /api nếu bạn có một số API dùng dạng đó
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
