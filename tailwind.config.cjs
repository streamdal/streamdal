const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}', 'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				streamdalYellow: "#FFD260",
				streamdalOrange: "#F8A577",
				streamdalPurple: "#956CFF",
				streamdalGreen: "#03CBA7",
				streamdalBlue: "#3197FF",
				streamdalRed: "#FF4040",
				streamdalPink: "#F489B0",
				web: "#372D56",
				eyelid: "#FF7D68",
				shadow: "#c0aafe",
				sunset: "#F9F7FF",
				stormCloud: "#7C7C86",
				haze: "#D1D3D9",
				cloud: "#FFFFFF",
				stream: "#C1AAFD",
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
				".btn-delete": {
					width: "137px",
					height: "47px",
					borderRadius: "4px",
					fontWeight: "bold",
					fontSize: "14px",
					color: "#FFFFFF",
					background: "#FF7D68",
					cursor: "pointer",
					'&:hover': {
						background: "linear-gradient(96.41deg, #FF7D68 -16.36%, #FFB9AD 101.19%)",
					},
				},
				".btn-secondary": {
					width: "100px",
					height: "47px",
					borderRadius: "4px",
					border: "none",
					fontWeight: "bold",
					fontSize: "14px",
					color: "#372D56",
					'&:hover': {
						background: "#F9F7FF",
					},
				},
			})
		}),
		require('flowbite/plugin')
	],
}
