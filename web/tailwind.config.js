/** @type {import('tailwindcss').Config} */
module.exports = {
	corePlugins: {
		preflight: false,
	},
	content: ["./src/**/*.{html,component.html,ts}"],
	theme: {
		extend: {
			colors: {
				grey: {
					100: "#F6F8FA",
				},
			},
		},
	},
	plugins: ["prettier-plugin-tailwindcss"],
};
