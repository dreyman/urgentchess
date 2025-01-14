<script>
import SvgBoard from '$lib/components/SvgBoard.svelte'
import Time from '$lib/components/Time.svelte'

/** @type {{ game: import('$lib/app/model.svelte.js').Game, side: Side, onmove?: function(Move):void }} */
let { game, side = 0, onmove = () => {} } = $props()
let orientation = $derived(side == 0 ? (Math.random() > 0.5 ? 1 : -1) : side)

/** @param {Move} move */
function on_board_move(move) {
	// FIXME shouldn't be possible to move if clock is not running
	onmove(move)
	game.apply_legal_move(move)
	return true
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
			<SvgBoard
				board={game.board}
				onmove={on_board_move}
				{side}
				{orientation}
				last_move={game.last_move}
				legal_moves={game.valid_moves}
				context={game.context}
			>
			</SvgBoard>
		</div>
		<Time time={game.clock.time2} ontimeout={on_black_timeout} />
	{/key}
</div>

<style>
</style>
