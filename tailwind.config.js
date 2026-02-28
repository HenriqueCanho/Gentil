/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: '#D4AF37', // Adiciona a cor accent diretamente
        gentil: {
          bg: '#0A1A19',
          card: '#2A6360',
          chip: '#275C59',
          accent: '#D4AF37',
          border: '#FFFFFF33',
          input: '#FFFFFF1A',
          muted: '#FFFFFF99',
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
