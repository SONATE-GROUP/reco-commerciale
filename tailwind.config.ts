import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "sonate-green": "#123C33",
        "sonate-green-dark": "#0d2a24",
        "sonate-green-mid": "#2f7d5b",
        "sonate-green-50": "#f3f8f5",
        "sonate-green-100": "#e7efe9",
        "sonate-green-border": "#cfe0da",
        "sonate-orange": "#FF6B3D",
        "sonate-orange-dark": "#c2410c",
        "sonate-orange-border": "#f4c9b8",
        "sonate-accent-soft": "#FFE3D6",
        "sonate-ivory": "#F6F1E8",
        "sonate-ivory-light": "#fcfaf5",
        "sonate-ink": "#1F2421",
        "sonate-ink-muted": "#6b6f6c",
        "sonate-cream-border": "#E8DFC9",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        sonate: "0 2px 6px rgba(18, 60, 51, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
