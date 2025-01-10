<script>
import ChessBoard from '$lib/components/ChessBoard.svelte'
import Time from '$lib/components/Time.svelte'

/** @type {{ game: import('$lib/app/model.svelte.js').Game, side: Side, onmove?: function(Move):void }} */
let { game, side = 0, onmove = () => {} } = $props()
let orientation = $derived(side == 0 ? (Math.random() > 0.5 ? 1 : -1) : side)

/** @param {Move} move */
function on_move(move) {
	// FIXME shouldn't be possible to move if clock is not running
	if (game.is_legal_move(move)) {
		onmove(move)
	}
	return game.move(move)
}

function on_white_timeout() {
	game.clock.stop()
	game.clock.time1.val = 0
	game.white_timeout = true
}

function on_black_timeout() {
	game.clock.stop()
	game.clock.time2.val = 0
	game.black_timeout = true
}
</script>

<div class="flex flex-col items-end" class:flex-col-reverse={orientation == 1}>
	{#key game}
		<Time time={game.clock.time1} ontimeout={on_white_timeout} />
		<div class="w-full">
			<ChessBoard board={game.board} {on_move} {side} {orientation} last_move={game.last_move}>
				{#if game.result_message != ''}
					<div class="board-overlay">
						<h1 class="board-message">{game.result_message}</h1>
					</div>
				{/if}
			</ChessBoard>
		</div>
		<Time time={game.clock.time2} ontimeout={on_black_timeout} />
	{/key}
</div>

<style>
.board-overlay {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.25);
/*	backdrop-filter: blur(0px);*/
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
