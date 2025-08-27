import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// A linha do 'vite-plugin-vue-devtools' foi removida daqui

// https://vite.dev/config/
export default defineConfig({
  build: {
    cssMinify: 'esbuild',
  },
  plugins: [
    vue(),
    vueJsx(),
    // A linha 'vueDevTools()' foi removida daqui
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
