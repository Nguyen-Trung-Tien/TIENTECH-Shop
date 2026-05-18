import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("redux") || id.includes("react-router")) {
              return "vendor-core";
            }
            if (id.includes("recharts") || id.includes("chart.js")) {
              return "vendor-charts";
            }
            if (id.includes("framer-motion") || id.includes("motion")) {
              return "vendor-animation";
            }
            if (id.includes("swiper")) {
              return "vendor-swiper";
            }
            if (id.includes("@paypal")) {
              return "vendor-paypal";
            }
            if (id.includes("lucide-react") || id.includes("react-icons")) {
              return "vendor-icons";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
