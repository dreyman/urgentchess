<script>
import { appconfig } from '$lib/app/appconfig.svelte'
import SvgBoard from '$lib/components/SvgBoard.svelte'
import CanvasBoard from '$lib/components/CanvasBoard.svelte'
import Time from '$lib/components/Time.svelte'

/** @type {{
 * game: import('$lib/app/model.svelte.js').Game,
 * side: Side,
 * onmove?: function(Move):void
 * render?: string
}}*/
let { game, side = 0, onmove = () => {}, render = 'svg' } = $props()
// let orientation = $derived(side == 0 ? (Math.random() > 0.5 ? 1 : -1) : side)
let orientation = 1
// let orientation = $state(side == 0 ? (Math.random() > 0.5 ? 1 : -1) : side)

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
		{#if game.clock}
		<Time
			time={game.clock.time1}
			ontimeout={on_white_timeout}
			activebg={appconfig.board.colors.light}
			inactivebg={appconfig.board.colors.dark}
		/>
		{/if}
		<div class="w-full">
			{#if render == 'canvas'}
				<CanvasBoard
					board={game.board}
					onmove={on_board_move}
					{side}
					{orientation}
					legal_moves={game.valid_moves}
					context={game.context}
					config={appconfig.board}
				></CanvasBoard>
			{:else}
				<SvgBoard
					board={game.board}
					onmove={on_board_move}
					{side}
					{orientation}
					legal_moves={game.valid_moves}
					context={game.context}
					config={appconfig.board}
				></SvgBoard>
			{/if}
		</div>
		{#if game.clock}
		<Time
			time={game.clock.time2}
			ontimeout={on_black_timeout}
			activebg={appconfig.board.colors.light}
			inactivebg={appconfig.board.colors.dark}
		/>
		{/if}
	{/key}
</div>

<style>
</style>
