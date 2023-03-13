/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./**/*.tsx'],
  theme: {
    extend: {
      colors: ({ colors }) => ({
        primary: colors.neutral[100],
        secondary: colors.neutral[400],
        tertiary: colors.neutral[700],
      }),
    },
    backgroundColor: ({ colors }) => ({
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      tertiary: colors.neutral[300],
    }),
  },
  plugins: [],
};
