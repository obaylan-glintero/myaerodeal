/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C9A55A',      // Refined Gold
        secondary: '#0A1628',    // Deep Navy
        accent: '#2E5A88',       // Aerospace Blue
        background: '#050A14',   // Midnight Navy
        cardBg: '#0F1B2E',       // Dark Navy
        border: '#1A2A42',       // Navy Gray
        textPrimary: '#F5F5F5',  // Off-White
        textSecondary: '#8A95A5' // Steel Gray
      }
    },
  },
  plugins: [],
}