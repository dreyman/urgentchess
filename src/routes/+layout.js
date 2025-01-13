import { appconfig } from '$lib/app/appconfig.svelte.js'

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	let resp = await fetch('/piece_sets/' + appconfig.board.piece_set + '.svg')
	let svg = await resp.text()
	return { piece_set_content: svg}
}
