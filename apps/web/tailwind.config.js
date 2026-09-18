/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Harmonious modern premium color palette
        // 조화롭고 현대적인 프리미엄 컬러 팔레트
        brand: {
          50: '#f2f8f5',
          100: '#e1efe7',
          500: '#1e7b4d', // Main forest green
          600: '#165d3a',
          900: '#0b2e1d',
        }
      }
    },
  },
  plugins: [],
}
