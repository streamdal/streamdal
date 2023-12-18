/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        purple: {
          dark: "#372D56",
          light: "#c0aafe",
          bright: "#ab6dee",
          divider: "#c2aafd4d",
          darkText: "#2B2343",
          background: {
            light: "#1F1930",
          },
        },
        yellow: {
          accent: "#FFD260",
          lightGradient: "#F1E5CB",
          darkGradient: "#F2D068",
        },
        notification: {
          checked: {
            bg: "#C7E6E7",
          },
          note: {
            bg: "#E8DFFF",
          },
          information: {
            bg: "#F7E7CC",
          },
          warning: {
            bg: "#FFDBD6",
          },
        },
      },
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  important: true,
};
