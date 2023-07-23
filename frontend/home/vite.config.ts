import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import type {
  ComponentResolver,
  ComponentResolveResult,
} from 'unplugin-vue-components/types'

const resolvers: ComponentResolver[] = [
  (name: string): ComponentResolveResult => {
    if (name === 'Form') {
      return { name: 'Form', from: 'vee-validate' }
    }
    return undefined
  },

  (name: string): ComponentResolveResult => {
    if (name === 'Field') {
      return { name: 'Field', from: 'vee-validate' }
    }
    return undefined
  },
]

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: true,
      dirs: ['./src/views/**'],
      resolvers: resolvers,
    }),
    AutoImport({
      dts: true,
      dirs: ['./src/modules/**', './src/util/**', './src/data/**'],
      vueTemplate: true,
      imports: [
        'vue',
        'vue-router',
        {
          '@/modules/config/config.store': [['default', 'CONFIG']],
          yup: [['*', 'yup']],
          axios: [['default', 'axios']],
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'home',
  },
  server: {
    port: 5173,
  },
})
