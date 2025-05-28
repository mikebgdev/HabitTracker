import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import path from 'path'
// @ts-ignore
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' }); // 👈 carga el .env.local desde la raíz

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
})
