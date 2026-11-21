import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF9F7',
        graphite: {
          50: '#F6F5F4',
          100: '#EDEBE8',
          200: '#DDDAD5',
          300: '#B8B4AD',
          400: '#8A867E',
          500: '#6B675F',
          600: '#524E47',
          700: '#3D3A34',
          800: '#2A2823',
          900: '#1C1A16',
        },
        forest: {
          50: '#F0F4F1',
          100: '#DCE7DF',
          200: '#B9CFC1',
          400: '#4A7A5C',
          500: '#33614A',
          600: '#254D38',
          700: '#1B3A2A',
          800: '#132B1F',
        },
        alert: {
          500: '#A8442E',
          600: '#8F3622',
          50: '#FBF2EF',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
