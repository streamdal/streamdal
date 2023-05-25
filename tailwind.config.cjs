/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
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
			},
			fontFamily: {
				sans: ["Inter"],
			},
		},
	},
	plugins: [],
}
