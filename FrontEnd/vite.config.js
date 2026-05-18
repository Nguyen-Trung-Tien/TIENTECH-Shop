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
            // Core React & State Management
            if (
              id.includes("node_modules/react/") || 
              id.includes("node_modules/react-dom/") || 
              id.includes("node_modules/react-router/") || 
              id.includes("node_modules/react-router-dom/") ||
              id.includes("node_modules/redux/") ||
              id.includes("node_modules/react-redux/") ||
              id.includes("node_modules/@reduxjs/toolkit/")
            ) {
              return "vendor-core";
            }
            
            // Charts
            if (id.includes("recharts") || id.includes("chart.js") || id.includes("react-chartjs-2")) {
              return "vendor-charts";
            }
            
            // Animation
            if (id.includes("framer-motion") || id.includes("motion")) {
              return "vendor-animation";
            }
            
            // UI & Icons
            if (id.includes("lucide-react") || id.includes("react-icons") || id.includes("reactstrap") || id.includes("bootstrap-icons")) {
              return "vendor-ui";
            }
            
            // Other specific large vendors
            if (id.includes("swiper")) {
              return "vendor-swiper";
            }
            if (id.includes("@paypal")) {
              return "vendor-paypal";
            }
            if (id.includes("axios") || id.includes("lodash") || id.includes("socket.io-client")) {
              return "vendor-utils";
            }
            
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
