const plugin = require('tailwindcss/plugin')

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
	plugins: [
		plugin(function({ addComponents }) {
			addComponents({
				".btn-heimdal": {
					width: "137px",
					height: "47px",
					borderRadius: "4px",
					fontWeight: "bold",
					fontSize: "14px",
					color: "#372D56",
					background: "#FFD260",
					cursor: "pointer",
					'&:hover': {
						background: "linear-gradient(96.41deg, #C1AAFD -16.36%, #FFD260 101.19%)",
					},
				},
			})
		})
	],
}
