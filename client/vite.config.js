import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  server: {
    cors: {
      // the origin you will be accessing via browser
      origin: process.env.VITE_API_URL,
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false,
      }, // Proxy all requests starting with "/api" to the backend
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
