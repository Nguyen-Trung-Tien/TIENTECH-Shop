import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router-dom") || id.includes("/react/")) {
              return "vendor-react";
            }
            if (id.includes("@reduxjs") || id.includes("redux")) {
              return "vendor-redux";
            }
            if (id.includes("recharts") || id.includes("d3-")) {
              return "vendor-recharts";
            }
            if (id.includes("react-icons")) {
              return "vendor-icons";
            }
            if (id.includes("framer-motion")) {
              return "vendor-framer";
            }
            if (id.includes("axios") || id.includes("lodash")) {
              return "vendor-utils";
            }
          }
        },
      },
    },
  },
});
