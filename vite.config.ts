import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@pages': path.resolve(process.cwd(), 'src/pages'),
      '@': path.resolve(process.cwd(), 'src')
    }
  }
})

