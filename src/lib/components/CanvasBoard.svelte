<script>
import { onMount } from "svelte"

/** @type {HTMLCanvasElement} */
let canvas
/** {CanvasRenderingContext2D} */
let ctx

let width = 500
let height = 500

let colors = {
	light: '#f0d9b5',
	dark: '#b58863',
}

onMount(() => {
	ctx = canvas.getContext('2d')
	if (!ctx) return
	const sq_height = height / 8
	const sq_width = width / 8

	for (let r = 0; r < 8; r++)
		for (let f = 0; f < 8; f++) {
			ctx.fillStyle = (r + f) % 2 == 0 ? colors.light : colors.dark
			ctx.fillRect(r * sq_width, f * sq_height, sq_width, sq_height)
		}
})

/** @param {MouseEvent} e */
function onclick(e) {
	console.log(e)
	console.log(e.offsetX + ' ' + e.offsetY)
}

</script>

<canvas class="w-full" bind:this={canvas} {width} {height} {onclick}></canvas>

<style>

</style>
