import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy tất cả các API qua /api -> http://localhost:8000/
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',         // thư mục đầu ra
    assetsDir: 'assets',    // thư mục chứa static (ảnh, js, css)
    sourcemap: true         // tạo file map để debug dễ hơn
  },
  resolve: {
    alias: {
      '@': '/src'           // cho phép import từ '@/components/...'
    }
  }
})
