<script>
import { Game, Clock } from '$lib/app/model.svelte.js'

/** @type {{ onsubmit: function(Game, Side):void, className: string }} */
let { onsubmit, className } = $props()
let minutes = $state(3)
let increment = $state(2)
/** @type Side */
let side = $state(0)

function submit() {
	if (minutes == 0) minutes = 0.05
	let time = minutes * 60_000
	let game = new Game(new Clock(time, time, time, increment * 1000))
	if (side == 0) side = Math.random() < 0.5 ? -1 : 1
	onsubmit(game, side)
}
</script>

<div class="create-game-form flex w-full flex-col items-center gap-2 px-4 {className}">
	<div><b>{minutes}</b> minutes per side</div>
	<input type="range" min="0" max="60" bind:value={minutes} class="w-full" />
	<div><b>{increment}</b> seconds increment</div>
	<input type="range" min="0" max="60" bind:value={increment} class="w-full" />
	<div class="select-side-group mt-6 flex justify-center">
		<button onclick={() => (side = 1)} class:active={side == 1}>WHITE</button>
		<button onclick={() => (side = 0)} class:active={side == 0}>RANDOM</button>
		<button onclick={() => (side = -1)} class:active={side == -1}>BLACK</button>
	</div>
	<button
		onclick={submit}
		class="submit font-2xl mt-8 bg-green-600 px-4 py-1 font-bold text-white hover:bg-green-500"
		>submit
	</button>
</div>

<style>
.submit,
.select-side-group > button {
	min-width: 7rem;
}

.select-side-group > button {
	padding: 0.1rem 0;
	border: 1px solid #c6c6c6;
	background: none;
	color: #c6c6c6;
	text-transform: lowercase;
}

.select-side-group > button.active {
	background: #c6c6c6;
	color: #272727;
	font-weight: bold;
}
</style>
