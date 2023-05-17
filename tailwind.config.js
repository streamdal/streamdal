/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/index.html"],
  theme: {
    extend: {
      colors: {
        purple: {
          dark: "#372D56",
          light: "#ECDDFF",
          bright: "#ab6dee",
          accent: "#956CFF"
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
  plugins: [],
}
