/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // `VITE_BASE=/memory-project-v2/` al publicar en GitHub Pages; en local se queda en la raíz.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    // Firestore's lazy chunk is ~580 kB; it only loads for a signed-in user.
    chunkSizeWarningLimit: 650,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
