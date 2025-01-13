<script>
/*
TODO:
- impl the ability to select piece on pawn promotion
- premove
- animations
- add settings per board (cog icon in the title)
- add mute board button in the title
- 2 more orientations
*/
import { piece_name } from '$lib/chess/util.js'
import { Piece, Color } from '$lib/chess/chess.js'
import { appconfig } from '$lib/app/appconfig.svelte.js'
import capture_sound from '$lib/audio/capture.mp3'
import move_sound from '$lib/audio/move.mp3'

let { board, onmove, side = 0, orientation: ori, last_move, context = {}, children } = $props()
let selected_piece = $state(-1)
let config = appconfig.board // FIXME instead of importing config, should get it from the props
/** @type {HTMLElement} */
let drag_el
let dragging = $state(false)
// let move_audio = new Audio(move_sound)
// let capture_audio = new Audio(capture_sound)

$effect(() => {
	if (!ori) {
		if (side == 0) ori = Math.random() > 0.5 ? 1 : -1
		else ori = side
	}
})

$effect(() => {
	if (last_move && config.sounds) {
		if (last_move.capture) new Audio(capture_sound).play()
		else new Audio(move_sound).play()
	}
})

function on_square_click(sq) {
	if (selected_piece != -1 && board[sq] / board[selected_piece] <= 0) {
		apply_move({ from: selected_piece, to: sq })
	}
}

function board_dnd(el) {
	let board_svg = el
	let drag_piece = null
	el.addEventListener('mousedown', on_drag_start)
	el.addEventListener('mousemove', on_drag)
	el.addEventListener('mouseup', on_drag_end)
	el.addEventListener('mouseleave', on_drag_end)
	el.addEventListener('touchstart', on_drag_start)
	el.addEventListener('touchmove', on_drag)
	el.addEventListener('touchend', on_drag_end)
	el.addEventListener('touchleave', on_drag_end)
	el.addEventListener('touchcancel', on_drag_end)

	function on_drag_start(e) {
		if (e.target.dataset.draggable == 'true') {
			e.preventDefault()
			let square = +e.target.dataset.square
			selected_piece = selected_piece == square ? -1 : square
			drag_piece = e.target
			drag_piece.setAttributeNS(null, 'opacity', config.piece_shadow_opacity)
			drag_el.setAttributeNS(null, 'href', get_symbol_for_piece(board[square]))
			drag_el.dataset.square = +e.target.dataset.square
			let mouse = get_mouse_position(e)
			drag_el.setAttributeNS(null, 'x', mouse.x - 0.5)
			drag_el.setAttributeNS(null, 'y', mouse.y - 0.5)
			dragging = true
		}
	}

	function on_drag(e) {
		if (dragging) {
			e.preventDefault()
			let mouse = get_mouse_position(e)
			drag_el.setAttributeNS(null, 'x', mouse.x - 0.5)
			drag_el.setAttributeNS(null, 'y', mouse.y - 0.5)
		}
	}

	function on_drag_end(e) {
		if (dragging) {
			drag_piece.setAttributeNS(null, 'opacity', 1)
			let pos = get_mouse_position(e)
			let move = { from: +drag_el.dataset.square, to: get_square_idx(pos) }
			if (move.from != move.to) apply_move(move)
		}
		dragging = false
	}

	function get_mouse_position(evt) {
		let { e, a, f, d } = board_svg.getScreenCTM()
		if (evt.changedTouches) evt = evt.changedTouches[0]
		return {
			x: (evt.clientX - e) / a,
			y: (evt.clientY - f) / d,
		}
	}
}

function apply_move(move) {
	let moved = onmove(move)
	if (moved) selected_piece = -1
}

function get_square_idx({ x, y }) {
	return (-ori * Math.floor(y) + (ori + 1) * 3.5) * 8 - 3.5 * (ori - 1) + ori * Math.floor(x)
}

function get_symbol_for_piece(piece) {
	let id = '#'
	if (piece < 0) id += 'b'
	else if (piece > 0) id += 'w'
	id += piece_name(piece)
	return id
}
</script>

<div class="relative">
	{#if children}
		{@render children()}
	{/if}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlns:x="http://www.w3.org/1999/xlink"
		viewBox="0 0 8 8"
		use:board_dnd
	>
		{#each { length: 8 }, file}
			{#each { length: 8 }, rank}
				{@const sq_idx = get_square_idx({ x: file, y: rank })}
				{@const square_color = (rank + file) % 2 == 1 ? config.colors.dark : config.colors.light}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<rect
					onclick={() => on_square_click(sq_idx)}
					width="1"
					height="1"
					x={file}
					y={rank}
					fill={sq_idx == selected_piece
						? `color-mix(in srgb, ${square_color} 50%, ${config.colors.selected_piece} 70%`
						: config.highlight_last_move &&
							  last_move &&
							  (last_move.from == sq_idx || last_move.to == sq_idx)
							? `color-mix(in srgb, ${square_color} 50%, ${config.colors.last_move} 70%`
							: square_color}
					id={file + rank}
				/>
			{/each}
		{/each}
		{#each board as piece, idx}
			{#if piece != 0}
				{@const x = (idx % 8) * ori - 3.5 * (ori - 1)}
				{@const y = -ori * Math.floor(idx / 8) + 3.5 * (ori + 1)}
				{#if config.highlight_king_in_check && ((context.white_in_check && piece == Piece.white_king) || (context.black_in_check && piece == Piece.black_king))}
					<circle cx={x + 0.5} cy={y + 0.5} r="0.5" fill="url('#king_in_check_gradient')" />
				{/if}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<use
					href={get_symbol_for_piece(piece)}
					onclick={() => on_square_click(idx)}
					x={x - 0.01 * config.piece_size}
					y={y - 0.01 * config.piece_size}
					data-square={idx}
					data-side={side}
					data-draggable={side == 0 || side / piece > 0}
					data-x={x}
					data-y={y}
					width={1 + 0.02 * config.piece_size}
					height={1 + 0.02 * config.piece_size}
				/>
			{/if}
		{/each}
		<use bind:this={drag_el} width="1" height="1" style:display={dragging ? 'block' : 'none'} />

		<defs>
			<radialGradient id="king_in_check_gradient">
				<stop offset="0%" stop-color="#ff0000" />
				<stop offset="40%" stop-color="#ff0000aa" />
				<stop offset="100%" stop-color="#ff000000" />
			</radialGradient>
		</defs>

		{@html config.piece_set_svg_content}
	</svg>
</div>

<style>
</style>
