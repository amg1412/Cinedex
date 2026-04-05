/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // CineDark Theme - Sleek, Movie-Focused
        primary: '#e8c547',      // Gold accent for CTAs
        secondary: '#0f1419',    // Deep navy background
        surface: '#1a1f2b',      // Card/surface color
        accent: '#45b649',       // Green for watched/logged
        'text-primary': '#e5e7eb', // Light text
        'text-secondary': '#9ca3af', // Muted text
      },
    },
  },
  plugins: [],
};
