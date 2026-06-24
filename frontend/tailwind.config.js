/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lg: {
          red: '#E30613',
          dark: '#1a1a2e',
          gray: '#f5f5f7',
        },
      },
    },
  },
  plugins: [],
}
