import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Alignées sur les tokens exacts du simulateur SEA (sonate-group/simulateur-commercial-sea)
        "sonate-green": "#1a2e25",
        "sonate-green-dark": "#142218",
        "sonate-green-mid": "#2f7d5b",
        "sonate-green-50": "#f3f8f5",
        "sonate-green-100": "#e7efe9",
        "sonate-green-border": "#2d4a3e",
        "sonate-orange": "#e8571a",
        "sonate-orange-dark": "#c2410c",
        "sonate-orange-border": "#f4c9b8",
        "sonate-accent-soft": "#FFE3D6",
        "sonate-ivory": "#f5f0e8",
        "sonate-ivory-light": "#fcfaf5",
        "sonate-ink": "#1F2421",
        "sonate-ink-muted": "#4a6a5a",
        "sonate-cream-border": "#ddd5c8",
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
