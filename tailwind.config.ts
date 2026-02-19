import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple 风格蓝色
        primary: {
          50: '#F5F9FF',
          100: '#E0EDFF',
          200: '#C2DDFF',
          300: '#9ACAFF',
          400: '#5BA3FF',
          500: '#007AFF',
          600: '#0063E0',
          700: '#0056CC',
          800: '#004DB3',
          900: '#004299',
        },
        // 学科颜色 - 更柔和的调色板
        'subject-408': '#3B82F6',
        'subject-math': '#10B981',
        'subject-english': '#F59E0B',
        'subject-politics': '#EF4444',
        // Apple 系统灰 - 更细腻
        'apple-gray': {
          50: '#F5F5F7',
          100: '#EBEBED',
          200: '#D2D2D7',
          300: '#B4B4B9',
          800: '#1D1D1F',
          900: '#000000',
          950: '#000000',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'apple': '20px',
        'apple-sm': '16px',
      },
      boxShadow: {
        'apple': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'apple-sm': '0 1px 4px rgba(0, 0, 0, 0.04)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'apple-glow': '0 0 20px rgba(0, 122, 255, 0.15)',
      },
      spacing: {
        'xxxl': '48px',
      },
    },
  },
  plugins: [],
};

export default config;
