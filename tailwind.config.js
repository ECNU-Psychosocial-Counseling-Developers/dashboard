const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    colors: {
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      blue: colors.blue,
      indigo: { ...colors.indigo, theme: '#1F2E41' },
      red: colors.rose,
      yellow: colors.amber,
      green: { ...colors.green, theme: '#72d4bb' },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
};
