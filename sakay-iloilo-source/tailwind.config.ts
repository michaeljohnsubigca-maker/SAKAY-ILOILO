import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        jeepAmber: "#f59e0b",
        trafficEmerald: "#10b981",
        slateNavy: "#0f172a",
        surface: "#faf8ff",
        "surface-container-low": "#f2f3ff",
        "surface-container-lowest": "#ffffff",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "sans-serif"],
        body: ["Inter", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "map-float": "0 4px 20px -2px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.08)",
        sheet: "0 -10px 30px -5px rgba(15, 23, 42, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
