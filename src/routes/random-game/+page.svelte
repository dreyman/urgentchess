<script>
import Game from '$lib/components/Game.svelte'
import { Game as ChessGame, Clock } from '$lib/app/model.svelte.js'

let game = $state(new ChessGame(new Clock(180_000, 180_000, 1000)))
let stopped = $state(false)
let speed = 50
let interval

function start() {
	stopped = false
	interval = setInterval(() => make_random_move(game), speed)
}

function stop() {
	stopped = true
	clearInterval(interval)
}

function reset() {
	game = new ChessGame(new Clock(180_000, 180_000, 1000))
	stopped = false
}

function make_random_move(game) {
	if (game.valid_moves.length == 0) {
		stop()
		return
	}
	let idx = Math.floor(Math.random() * game.valid_moves.length)
	let random_move = game.valid_moves[idx]
	game.move(random_move)
}
</script>

<div class="w-full md:w-128">
	<Game {game} side={0} />
</div>
{#if game.moves.length == 0}
	<button
		onclick={start}
		class="w-full bg-green-600 py-4 text-2xl font-bold text-white hover:bg-green-400">START</button
	>
{:else if !stopped}
	<button
		onclick={stop}
		class="w-full bg-red-600 py-4 text-2xl font-bold text-white hover:bg-red-400">STOP</button
	>
{/if}
{#if stopped}
	<button
		onclick={reset}
		class="w-full bg-orange-600 py-4 text-2xl font-bold text-white hover:bg-orange-400"
		>RESET</button
	>
{/if}

<style>
</style>
