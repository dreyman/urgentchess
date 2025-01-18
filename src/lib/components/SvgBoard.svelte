<script>
/*
TODO:
- impl the ability to select piece on pawn promotion
- premove
- animations
- add settings per board (cog icon in the title)
- add mute board button in the title
- 2 more orientations
- show shadow of the piece being dragged
*/
import * as util from '$lib/chess/util.js'
import { Piece, Color } from '$lib/chess/chess.js'
import { appconfig, hightlighted_square_color } from '$lib/app/appconfig.svelte.js'
import capture_sound from '$lib/audio/capture.mp3'
import move_sound from '$lib/audio/move.mp3'

/** @type {{
 * board: number[]
 * onmove: function(Move):boolean
 * side: Side
 * orientation: -1 | 1
 * context?: GameContext
 * legal_moves: Move[]
 * config: any
 }} */
let { board, onmove, side = 0, orientation: ori, context, legal_moves, config } = $props()
if (!context) context = util.empty_context()
let selected_piece = $state(-1)
/** @type {SVGUseElement} */
let drag_el
let dragging = $state(false)
let last_move = $derived(
	context && context.moves && context.moves.length > 0
		? context.moves[context.moves.length - 1]
		: null
)
/** @type {{visible: boolean, move: Move}} */
let pawn_promotion_select = $state({ visible: false, move: { from: 0, to: 1 } })
// let move_audio = new Audio(move_sound)
// let capture_audio = new Audio(capture_sound)

// $effect(() => {
// 	if (!ori) {
// 		if (side == 0) ori = Math.random() > 0.5 ? 1 : -1
// 		else ori = side
// 	}
// })

// FIXME this effect causes move sound when switching to svg board rendering and mb in other cases as well
$effect(() => {
	if (last_move && config.sounds) {
		if (last_move.capture) new Audio(capture_sound).play()
		else new Audio(move_sound).play()
	}
})

/** @param {number} sq */
function on_square_click(sq) {
	if (selected_piece != -1 && board[sq] / board[selected_piece] <= 0) {
		apply_move({ from: selected_piece, to: sq })
	}
}

/** @param {SVGSVGElement} el */
function board_dnd(el) {
	let board_svg = el
	/** @type {SVGUseElement | null} */
	let drag_piece = null
	el.addEventListener('mousedown', on_drag_start)
	el.addEventListener('mousemove', on_drag)
	el.addEventListener('mouseup', on_drag_end)
	el.addEventListener('mouseleave', on_drag_end)
	el.addEventListener('touchstart', on_drag_start)
	el.addEventListener('touchmove', on_drag)
	el.addEventListener('touchend', on_drag_end)
	el.addEventListener('touchcancel', on_drag_end)

	/** @param {MouseEvent | TouchEvent} e */
	function on_drag_start(e) {
		/** @type {EventTarget | null} */
		let target = e.target
		if (target && target instanceof SVGUseElement && target.dataset.draggable == 'true') {
			e.preventDefault()
			if (!target.dataset.square) return
			let square = +target.dataset.square
			selected_piece = selected_piece == square ? -1 : square
			drag_piece = target
			drag_piece.setAttributeNS(null, 'opacity', config.piece_shadow_opacity.toString())
			drag_el.setAttributeNS(null, 'href', get_symbol_for_piece(board[square]))
			drag_el.dataset.square = target.dataset.square
			let mouse = get_mouse_position(e)
			drag_el.setAttributeNS(null, 'x', (mouse.x - 0.5).toString())
			drag_el.setAttributeNS(null, 'y', (mouse.y - 0.5).toString())
			dragging = true
		}
	}

	/** @param {MouseEvent | TouchEvent} e */
	function on_drag(e) {
		if (dragging) {
			e.preventDefault()
			let mouse = get_mouse_position(e)
			drag_el.setAttributeNS(null, 'x', (mouse.x - 0.5).toString())
			drag_el.setAttributeNS(null, 'y', (mouse.y - 0.5).toString())
		}
	}

	/** @param {MouseEvent | TouchEvent} e */
	function on_drag_end(e) {
		if (dragging && drag_piece) {
			drag_piece.setAttributeNS(null, 'opacity', '1')
			let pos = get_mouse_position(e)
			let move = { from: +drag_el.dataset.square, to: get_square_idx(pos) }
			if (move.from != move.to) apply_move(move)
		}
		dragging = false
	}

	/**
	 * @param {any} event
	 * @returns {{x: number, y: number}}
	 */
	function get_mouse_position(event) {
		let { e, a, f, d } = board_svg.getScreenCTM()
		if (event.changedTouches) event = event.changedTouches[0]
		return {
			x: (event.clientX - e) / a,
			y: (event.clientY - f) / d,
		}
	}
}

/**
 * @param {Move} move
 * @param {number} [promotion_piece]
 */
function apply_move(move, promotion_piece) {
	let is_legal_move = legal_moves.findIndex(m => m.from == move.from && m.to == move.to) != -1
	if (!is_legal_move) return
	if (!promotion_piece && util.is_pawn_promotion(move, board)) {
		pawn_promotion_select = {
			visible: true,
			move,
		}
		return
	}
	pawn_promotion_select.visible = false
	if (promotion_piece) move.promotion_piece = promotion_piece
	let moved = onmove(move)
	if (moved) selected_piece = -1
}

/** @param {{x: number, y: number}} xy */
function get_square_idx({ x, y }) {
	return (-ori * Math.floor(y) + (ori + 1) * 3.5) * 8 - 3.5 * (ori - 1) + ori * Math.floor(x)
}

/** @param {number} piece */
function get_symbol_for_piece(piece) {
	let id = '#'
	if (piece < 0) id += 'b'
	else if (piece > 0) id += 'w'
	id += util.piece_name(piece)
	return id
}
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	xmlns:x="http://www.w3.org/1999/xlink"
	viewBox="0 0 8 8"
	use:board_dnd
>
	<defs>
		<radialGradient id="king_in_check_gradient">
			<stop offset="0%" stop-color="#ff0000" />
			<stop offset="40%" stop-color="#ff0000aa" />
			<stop offset="100%" stop-color="#ff000000" />
		</radialGradient>
	</defs>

	{@html config.piece_set_svg_content}

	{#each board as piece, sq}
		{@const x = (sq % 8) * ori - 3.5 * (ori - 1)}
		{@const y = -ori * Math.floor(sq / 8) + 3.5 * (ori + 1)}
		{@const file = sq % 8}
		{@const rank = Math.floor(sq / 8)}
		{@const square_color = util.dark(sq) ? config.colors.dark : config.colors.light}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<rect
			onclick={() => on_square_click(sq)}
			width="1"
			height="1"
			{x}
			{y}
			fill={sq == selected_piece
				? hightlighted_square_color(square_color, config.colors.selected_piece)
				: config.highlight_last_move && last_move && (last_move.from == sq || last_move.to == sq)
					? hightlighted_square_color(square_color, config.colors.last_move)
					: square_color}
		/>
		{#if piece != 0}
			{@const draggable = side == 0 || piece / side > 0}
			{#if config.highlight_king_in_check && ((context.white_in_check && piece == Piece.white_king) || (context.black_in_check && piece == Piece.black_king))}
				<circle cx={x + 0.5} cy={y + 0.5} r="0.5" fill="url('#king_in_check_gradient')" />
			{/if}

			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<use
				href={get_symbol_for_piece(piece)}
				onclick={() => on_square_click(sq)}
				x={x - 0.01 * config.piece_size}
				y={y - 0.01 * config.piece_size}
				data-square={sq}
				data-draggable={draggable}
				width={1 + 0.02 * config.piece_size}
				height={1 + 0.02 * config.piece_size}
			/>
		{/if}
	{/each}

	<use bind:this={drag_el} width="1" height="1" style:display={dragging ? 'block' : 'none'} />

	{#if pawn_promotion_select.visible}
		{@const color = pawn_promotion_select.move.to < 8 ? Color.black : Color.white}
		{@const x = (pawn_promotion_select.move.to % 8) * ori - 3.5 * (ori - 1)}
		{@const first_prom_piece_y = -ori * Math.floor(pawn_promotion_select.move.to / 8) + 3.5 * (ori + 1)}

		{#each util.pawn_promotion_pieces as prom_piece, idx}
			{@const prom_piece_y = first_prom_piece_y + idx * color * ori}
			<rect {x} y={prom_piece_y} width="1" height="1" fill={config.colors.promotion_piece_bg} />
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<use
				href={get_symbol_for_piece(color * prom_piece)}
				onclick={() => apply_move(pawn_promotion_select.move, color * prom_piece)}
				x={x - 0.01 * config.piece_size}
				y={prom_piece_y}
				width={1 + 0.02 * config.piece_size}
				height={1 + 0.02 * config.piece_size}
				class="animate-pulse-1"
			/>
		{/each}


	{/if}
</svg>

<style>
</style>
