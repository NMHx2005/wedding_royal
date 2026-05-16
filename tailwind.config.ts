import type { Config } from "tailwindcss";

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
        mewedding: {
          rose: "#b5606e",
          blush: "#f4c2c2",
        },
      },
    },
  },
  plugins: [],
};
export default config;
