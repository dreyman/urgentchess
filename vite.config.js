import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	build: {
		assetsInlineLimit: Infinity
	},
	plugins: [sveltekit()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
