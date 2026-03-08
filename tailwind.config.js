/** @type {import('tailwindcss').Config} */
const tokens = require('./src/theme/tokens');

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        gentil: {
          accent: tokens.accent,
          bg: tokens.bg,
          text: tokens.text,
          muted: tokens.muted,
          border: tokens.border,
          card: tokens.card,
        },
      },
      fontFamily: {
        fraunces: ['Fraunces_400Regular', 'serif'],
        'fraunces-bold': ['Fraunces_700Bold', 'serif'],
        'fraunces-semi': ['Fraunces_600SemiBold', 'serif'],
      },
    },
  },
  plugins: [],
};
