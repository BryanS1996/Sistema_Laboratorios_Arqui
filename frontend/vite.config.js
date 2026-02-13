import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    proxy: {
      '/auth': {
        target: process.env.VITE_API_URL || 'http://backend:3000',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
