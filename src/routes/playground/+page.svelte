<script>
import { Game as ChessGame, Clock } from '$lib/app/model.svelte.js'
import Game from '$lib/components/Game.svelte'
import * as util from '$lib/chess/util.js'
import { appconfig } from '$lib/app/appconfig.svelte.js'
import Container from '$lib/components/Container.svelte'
import CanvasBoard from '$lib/components/CanvasBoard.svelte'


let time = 12 * 60_000
let game = new ChessGame(new Clock(time, time, time, 2_000))
let title = $derived(game.result_message ? game.result_message : 'Game')
/** @type {Side} */
let side = $state(0)
let board_rendering = 'canvas'

game.try_move({from: 12, to: 28})
game.try_move({from: 51, to: 35})
game.try_move({from: 28, to: 35})
game.try_move({from: 50, to: 42})
game.try_move({from: 35, to: 42})
game.try_move({from: 55, to: 39})
game.try_move({from: 42, to: 49})
game.try_move({from: 39, to: 31})
game.try_move({from: 8, to: 24})
game.try_move({from: 31, to: 23})
game.try_move({from: 24, to: 32})
game.try_move({from: 23, to: 14})


$effect(() => {
	side = !game.last_move || game.board[game.last_move.to] < 0 ? 1 : -1
})

/** @param {Move} move */
function onmove(move) {}
</script>

<Container
	{title}
	resize="horizontal"
	minwidth={250}
	width={600}
	left="center"
	top="center"
>
	<Game {game} {side} {onmove} render={board_rendering} />
	{#if game.result_message != ''}
		<div class="board-overlay">
			<h1 class="board-message">{game.result_message}</h1>
		</div>
	{/if}
</Container>

<!-- <Container
	{title}
	minwidth={250}
	width={600}
	left="center"
	top="center"
>
	<CanvasBoard board={game.board} {side} context={game.context} onmove={move => game.try_move(move)} config={appconfig.board} />
</Container> -->

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
