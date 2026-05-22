import type { Config } from "tailwindcss";

/** Palette xanh navy từ màu chủ đạo #152238 */
const brandRose = {
  50: "#f0f3f7",
  100: "#dce3ef",
  200: "#b9c5d8",
  300: "#8da0be",
  400: "#5d7296",
  500: "#152238",
  600: "#121d32",
  700: "#0e1728",
  800: "#0a111e",
  900: "#060b14",
  950: "#03060a",
};

const brandPink = {
  50: "#eef2f8",
  100: "#dce4f0",
  200: "#b8c8de",
  300: "#8fa6c8",
  400: "#5a759f",
  500: "#243a5c",
  600: "#1a2d4a",
  700: "#152238",
  800: "#101a2c",
  900: "#0b121f",
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      transitionTimingFunction: {
        gentle: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        gentle: "550ms",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
      },
      zIndex: {
        "modal-backdrop": "55",
        modal: "60",
        dropdown: "65",
        fab: "45",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: "#152238",
          hover: "#1a2d4a",
          light: "#e9edf4",
          muted: "#dce3ef",
        },
        mewedding: {
          rose: "var(--brand-primary)",
          blush: "var(--brand-primary-light)",
        },
        rose: brandRose,
        pink: brandPink,
      },
    },
  },
  plugins: [],
};
export default config;
