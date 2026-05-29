/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-deep': 'var(--paper-deep)',
        ink: 'var(--ink)',
        leaf: 'var(--leaf)',
        sky: 'var(--sky)',
        orange: 'var(--orange)',
        pink: 'var(--pink)',
      },
      boxShadow: {
        sketch: '0 20px 50px rgb(41 64 69 / 0.10), 0 6px 0 rgb(41 64 69 / 0.08)',
        soft: '0 16px 40px rgb(41 64 69 / 0.08)',
      },
    },
  },
  plugins: [],
};
