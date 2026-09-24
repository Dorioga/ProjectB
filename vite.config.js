import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/storage": {
        target: process.env.VITE_STORAGE_URL || "https://nexusplataforma.com",
        changeOrigin: true,
        secure: true,
      },
      "/backend-proxy": {
        target:
          process.env.VITE_API_BACKEND_URL ||
          "https://backend-barranquilla.onrender.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/backend-proxy/, ""),
      },
    },
  },
});
