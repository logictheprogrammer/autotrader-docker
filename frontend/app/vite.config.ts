import { fileURLToPath, URL } from "node:url";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: true,
      types: [],
    }),
    AutoImport({
      dts: true,
      dirs: ["./src/stores", "./src/types"],
      imports: ["vue", "vue-router"],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "../server/build/app",
  },
});
