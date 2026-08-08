import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API_PROXY = "http://localhost:4000";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": API_PROXY,
    },
  },
  preview: {
    proxy: {
      "/api": API_PROXY,
    },
  },
});
