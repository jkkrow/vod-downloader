const defaultTheme = require('tailwindcss/defaultTheme');
const scrollbar = require('tailwind-scrollbar');
const lineClamp = require('@tailwindcss/line-clamp');

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./**/*.tsx'],
  theme: {
    borderRadius: rem2px(defaultTheme.borderRadius),
    columns: rem2px(defaultTheme.columns),
    fontSize: rem2px(defaultTheme.fontSize),
    lineHeight: rem2px(defaultTheme.lineHeight),
    maxWidth: ({ theme, breakpoints }) => ({
      ...rem2px(defaultTheme.maxWidth({ theme, breakpoints })),
    }),
    spacing: rem2px(defaultTheme.spacing),

    extend: {
      colors: ({ colors }) => ({
        primary: colors.neutral[100],
        secondary: colors.neutral[500],
        tertiary: colors.neutral[700],
        inversed: colors.neutral[900],
        hover: colors.neutral[300],
        disabled: colors.neutral[400],
        'hover-inversed': colors.neutral[700],
      }),
      backgroundColor: ({ colors }) => ({
        primary: colors.neutral[900],
        secondary: colors.neutral[500],
        tertiary: colors.neutral[300],
        inversed: colors.neutral[100],
        hover: colors.neutral[700],
        disabled: colors.neutral[600],
        'hover-inversed': colors.neutral[300],
      }),
    },
  },
  plugins: [scrollbar({ nocompatible: true }), lineClamp],
};

function rem2px(input, fontSize = 16) {
  if (input == null) {
    return input;
  }
  switch (typeof input) {
    case 'object':
      if (Array.isArray(input)) {
        return input.map((val) => rem2px(val, fontSize));
      } else {
        const ret = {};
        for (const key in input) {
          ret[key] = rem2px(input[key]);
        }
        return ret;
      }
    case 'string':
      return input.replace(
        /(\d*\.?\d+)rem$/,
        (_, val) => parseFloat(val) * fontSize + 'px'
      );
    default:
      return input;
  }
}
