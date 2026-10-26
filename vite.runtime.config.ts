import { localIconPlugin } from "./scripts/local-icon-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ command }) => ({
  base: "./",
  optimizeDeps: { entries: ["index.html", "player.html"] },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        player: "player.html",
      },
    },
  },
  plugins: [
    localIconPlugin(command),
    react(),

  ],
}));
