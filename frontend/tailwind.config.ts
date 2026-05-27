import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Judicore Design System
        ink: {
          950: "#050816",
          900: "#0A0E1E",
          800: "#0F1428",
          700: "#161B33",
          600: "#1F2540",
          500: "#2A3252",
        },
        paper: {
          50: "#F8FAFC",
          100: "#EEF2FA",
          200: "#E2E8F5",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        // Brand accents
        electric: {
          DEFAULT: "#4CC9FF",
          50: "#E5F8FF",
          100: "#C7EFFF",
          200: "#9CE2FF",
          300: "#70D5FF",
          400: "#4CC9FF",
          500: "#2BB4F2",
          600: "#1696D6",
          700: "#0B73AB",
          800: "#055281",
          900: "#01365A",
        },
        neon: {
          DEFAULT: "#8B5CF6",
          50: "#F2EBFE",
          100: "#E3D5FD",
          200: "#C7AEFB",
          300: "#AC88F9",
          400: "#9A6FF8",
          500: "#8B5CF6",
          600: "#6E36F3",
          700: "#5417D8",
          800: "#3D11A0",
          900: "#260A66",
        },
        // Legacy aliases (preserve existing components)
        brand: {
          violet: "#8B5CF6",
          indigo: "#6366F1",
          fuchsia: "#D946EF",
          gold: "#F5B544",
          mint: "#34D399",
          rose: "#FB7185",
          sky: "#4CC9FF",
          electric: "#4CC9FF",
          neon: "#8B5CF6",
        },
        line: {
          subtle: "rgba(255,255,255,0.06)",
          DEFAULT: "rgba(255,255,255,0.10)",
          strong: "rgba(255,255,255,0.18)",
        },
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-grotesk)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-plex-mono)", "var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      letterSpacing: {
        "ultra-tight": "-0.04em",
        "cinematic": "-0.05em",
      },
      borderRadius: {
        "verdict": "18px",
        "verdict-sm": "12px",
        "verdict-lg": "24px",
      },
      backgroundImage: {
        "aurora-dark": "radial-gradient(80% 60% at 50% -10%, rgba(76,201,255,0.20), transparent 60%), radial-gradient(50% 35% at 90% 5%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(45% 40% at 5% 100%, rgba(76,201,255,0.10), transparent 60%)",
        "aurora-light": "radial-gradient(80% 60% at 50% -10%, rgba(76,201,255,0.16), transparent 60%), radial-gradient(50% 35% at 90% 5%, rgba(139,92,246,0.14), transparent 60%)",
        "grid-dark": "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "grid-light": "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
        "headline-dark": "linear-gradient(110deg, #F8FAFC 0%, #4CC9FF 35%, #C7AEFB 65%, #F8FAFC 100%)",
        "headline-light": "linear-gradient(110deg, #0F172A 0%, #1696D6 35%, #6E36F3 65%, #0F172A 100%)",
        "tile-violet": "linear-gradient(135deg, rgba(139,92,246,0.16) 0%, rgba(76,201,255,0.06) 100%)",
        "tile-electric": "linear-gradient(135deg, rgba(76,201,255,0.18) 0%, rgba(76,201,255,0.04) 100%)",
        "tile-gold": "linear-gradient(135deg, rgba(245,181,68,0.18) 0%, rgba(245,181,68,0.04) 100%)",
        "tile-mint": "linear-gradient(135deg, rgba(52,211,153,0.16) 0%, rgba(52,211,153,0.04) 100%)",
        "tile-rose": "linear-gradient(135deg, rgba(251,113,133,0.16) 0%, rgba(251,113,133,0.04) 100%)",
      },
      backgroundSize: {
        "grid-sm": "32px 32px",
        "grid-md": "48px 48px",
      },
      boxShadow: {
        "neon-electric": "0 0 0 1px rgba(76,201,255,0.35), 0 0 36px -4px rgba(76,201,255,0.45)",
        "neon-violet": "0 0 0 1px rgba(139,92,246,0.35), 0 0 36px -4px rgba(139,92,246,0.45)",
        "glass-dark": "0 1px 0 rgba(255,255,255,0.06) inset, 0 20px 40px -20px rgba(0,0,0,0.6)",
        "glass-light": "0 1px 0 rgba(255,255,255,0.8) inset, 0 20px 40px -20px rgba(15,23,42,0.08)",
        "card-dark": "0 1px 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.06), 0 30px 60px -30px rgba(0,0,0,0.6)",
        "card-light": "0 1px 0 rgba(255,255,255,0.9) inset, 0 0 0 1px rgba(15,23,42,0.06), 0 30px 60px -30px rgba(15,23,42,0.10)",
        "core-glow": "0 0 60px -10px rgba(76,201,255,0.6), 0 0 120px -20px rgba(139,92,246,0.5)",
      },
      animation: {
        "orbit": "orbit 30s linear infinite",
        "orbit-reverse": "orbit 30s linear infinite reverse",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 4s linear infinite",
        "gradient-x": "gradient-x 14s ease infinite",
        "neural": "neural 8s ease-in-out infinite",
        "scan": "scan 4s linear infinite",
        "marquee": "marquee 40s linear infinite",
        "marquee-reverse": "marquee 50s linear infinite reverse",
      },
      keyframes: {
        "orbit": {
          "0%":   { transform: "rotate(0deg) translateX(var(--orbit-r, 220px)) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(var(--orbit-r, 220px)) rotate(-360deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(76,201,255,0.4)" },
          "50%": { boxShadow: "0 0 0 16px rgba(76,201,255,0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "neural": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.8" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
