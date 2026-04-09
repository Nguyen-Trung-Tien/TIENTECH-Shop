import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Đảm bảo đường dẫn tương đối để chạy được trên GitHub Pages
  plugins: [
    react(),
    tailwindcss(),
  ],
})
