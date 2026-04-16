import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Calendly brand blue
        cal: {
          50:  "#EBF3FF",
          100: "#CCE2FF",
          200: "#99C5FF",
          300: "#66A8FF",
          400: "#338AFF",
          500: "#006BFF",   // primary
          600: "#0056CC",
          700: "#004099",
          800: "#002B66",
          900: "#001533",
        },
      },
      fontSize: {
        "2xs": ["11px", "16px"],
        xs:    ["12px", "16px"],
        sm:    ["13px", "20px"],
        base:  ["14px", "22px"],
        lg:    ["16px", "24px"],
        xl:    ["18px", "28px"],
        "2xl": ["22px", "32px"],
      },
      boxShadow: {
        "cal-sm":  "0 1px 3px rgba(0,0,0,0.08)",
        "cal-md":  "0 2px 8px rgba(0,0,0,0.10)",
        "cal-lg":  "0 4px 16px rgba(0,0,0,0.12)",
        "cal-btn": "0 1px 3px rgba(0,107,255,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;