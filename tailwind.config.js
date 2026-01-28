/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          lime: "#ccff00",
          pink: "#ff00ff",
          cyan: "#00ffff",
          purple: "#bf00ff",
        },
        dark: {
          base: "#0a0a0a",
          surface: "#121212",
          card: "#1e1e1e",
          overlay: "rgba(255, 255, 255, 0.05)"
        }
      },
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'wave': 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(14deg)' },
          '75%': { transform: 'rotate(-8deg)' },
        },
      },
    },
  },
  plugins: [],
}
