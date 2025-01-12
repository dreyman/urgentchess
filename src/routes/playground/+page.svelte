<script>
import { Game as ChessGame, Clock } from '$lib/app/model.svelte.js'
import Game from '$lib/components/Game.svelte'
import Container from '$lib/components/Container.svelte'

let time = 12 * 60_000
let game = new ChessGame(new Clock(time, time, time, 2_000))
let title = $derived(game.result_message ? game.result_message : 'Game')
/** @type {Side} */
let side = $state(0)

$effect(() => {
	side = !game.last_move || game.board[game.last_move.to] < 0 ? 1 : -1
})

function onmove() {}
</script>

<Container
	{title}
	resize="horizontal"
	minwidth={250}
	width={500}
	height="auto"
	left="center"
	top="center"
>
	<Game {game} {side} {onmove} />
</Container>

<style>
</style>
