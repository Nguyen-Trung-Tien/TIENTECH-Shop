/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e293b",
          light: "#334155",
          dark: "#0f172a",
        },
        brand: {
          DEFAULT: "#f43f5e",
          light: "#fb7185",
          dark: "#e11d48",
        },
        dark: {
          bg: "#0f172a", // Background tối sâu
          surface: "#1e293b", // Bề mặt card tối
          border: "#334155",
          text: {
            primary: "#f1f5f9",
            secondary: "#94a3b8",
          }
        }
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
