
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
        'brand-purple': '#8A2BE2',
        'brand-green': '#00F0B5',
        'dark-bg': '#1a1a1a',
        'light-bg': '#2a2a2a',
        'glass-bg': 'rgba(26, 26, 26, 0.5)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      backdropBlur: {
        'xl': '24px',
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
