import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple 风格配色
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#007AFF',
          600: '#0066CC',
          700: '#0052A3',
        },
        // 学科颜色
        'subject-408': '#3B82F6',
        'subject-math': '#10B981',
        'subject-english': '#F59E0B',
        'subject-politics': '#EF4444',
        // Apple 系统灰
        'apple-gray': {
          50: '#F5F5F7',
          100: '#E8E8ED',
          200: '#D2D2D7',
          800: '#1D1D1F',
          900: '#000000',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'apple': '18px',
        'apple-sm': '12px',
      },
      boxShadow: {
        'apple': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
};

export default config;
