/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#070A10',
          card: '#151C2C',
          border: '#2D3748',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          orange: '#F97316',
          rose: '#EF4444',
          purple: '#8B5CF6',
        }
      }
    },
  },
  plugins: [],
}
