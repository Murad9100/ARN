import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'https://arn-sd6r.onrender.com',
      '/ws': { target: 'wss://arn-sd6r.onrender.com/ws', ws: true },
    },
  },
})
