<script>
import { Game as ChessGame, Clock } from '$lib/app/model.svelte.js'
import Game from '$lib/components/Game.svelte'
import Container from '$lib/components/Container.svelte'
// import CanvasBoard from '$lib/components/CanvasBoard.svelte'

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
	{#if game.result_message != ''}
		<div class="board-overlay">
			<h1 class="board-message">{game.result_message}</h1>
		</div>
	{/if}
</Container>

<!-- <Container
	{title}
	resize="horizontal"
	minwidth={250}
	width={500}
	height="auto"
	left="center"
	top="center"
>
	<CanvasBoard />
</Container>
 -->
<style>
.board-overlay {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.25);
	backdrop-filter: blur(1px);
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.board-message {
	background: rgba(0, 0, 0, 0.5);
	text-align: center;
	color: #fff;
	font-size: 2rem;
	font-weight: bold;
}
</style>
