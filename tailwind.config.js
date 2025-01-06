/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			spacing: {
				'128': '32rem',
			},
			animation: {
				'pulse-1': 'pulse 1s cubic-bezier(0, 0, 1, 1) infinite;'
			},
		}
	},

	plugins: [],
	experimental: {
		optimizeUniversalDefaults: true
	}
};
