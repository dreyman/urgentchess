<!--
TODO:
- Resizing canvas/container is broken since SQ is fixed
- pawn promotion
- handle all the other appconfig values
 -->
<script>
import { onMount } from 'svelte'
import { Piece, Color } from '$lib/chess/chess.js'
import * as util from '$lib/chess/util.js'
import { appconfig, hightlighted_square_color } from '$lib/app/appconfig.svelte.js'

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
let last_move = $derived(
	context && context.moves && context.moves.length > 0
		? context.moves[context.moves.length - 1]
		: null
)
/** @type {HTMLCanvasElement} */
let board_canvas
/** @type {HTMLCanvasElement} */
let pieces_canvas
/** @type {HTMLCanvasElement} */
let dnd_canvas
/** @type {CanvasRenderingContext2D} */
let bctx
/** @type {CanvasRenderingContext2D} */
let pctx
/** @type {CanvasRenderingContext2D} */
let dnd_ctx
/** @type {{piece: number, square: number, image: CanvasImageSource} | null} */
let dragging = null

let images = new Map()
// let color_to_move = $derived(context.moves.length % 2 == 1 ? Color.black : Color.white )

let selected_piece = {
	/** @type {number | null} */
	_sq: null,
	_file: -1,
	_rank: -1,
	/** @param {number | null} s */
	set square(s) {
		if (this._sq == s) return
		if (this._sq) draw_square(this._file, this._rank, square_color(this._sq))
		this._sq = s
		if (s) {
			;[this._file, this._rank] = get_file_and_rank(s)
			draw_square(this._file, this._rank, config.colors.selected_piece + '80')
		}
	},
	/** @returns {number | null} */
	get square() {
		return this._sq
	},
}

let width = 600
let height = 600
let SQ = width / 8
let piece_set = 'merida'
let mounted = $state(false)

$effect(() => {
	if (mounted) {
		draw_board()
		pctx.clearRect(0, 0, pieces_canvas.width, pieces_canvas.height)
		for (let sq = 0; sq < board.length; ++sq)
			if (board[sq] != 0) draw_piece(pctx, sq, images.get(board[sq]))
	}
})

$effect(() => {
	if (mounted && last_move) {
		let [file, rank] = get_file_and_rank(last_move.from)
		draw_square(
			file,
			rank,
			hightlighted_square_color(square_color(last_move.from), config.colors.last_move)
		)
		;[file, rank] = get_file_and_rank(last_move.to)
		draw_square(
			file,
			rank,
			hightlighted_square_color(square_color(last_move.to), config.colors.last_move)
		)
	}
})

onMount(async () => {
	let board_context2d = board_canvas.getContext('2d', { alpha: false })
	let pieces_context2d = pieces_canvas.getContext('2d')
	let dnd_context2d = dnd_canvas.getContext('2d')

	if (!board_context2d || !pieces_context2d || !dnd_context2d) return
	bctx = board_context2d
	pctx = pieces_context2d
	dnd_ctx = dnd_context2d

	dnd_canvas.addEventListener('mousemove', onmousemove)
	dnd_canvas.addEventListener('mousedown', onmousedown)
	dnd_canvas.addEventListener('mouseup', onmouseup)

	let promises = []
	for (let piece = 1; piece <= 6; piece++) {
		promises.push(load_image_for_piece(Color.white * piece))
		promises.push(load_image_for_piece(Color.black * piece))
	}
	let imgs = await Promise.all(promises)
	imgs.forEach(({ piece, image }) => images.set(piece, image))

	mounted = true
})

/** @param {MouseEvent} e */
function onmousedown({ offsetX: x, offsetY: y }) {
	let [file, rank] = get_file_and_rank_for_xy(x, y)
	let square = rank * 8 + file
	let piece = board[square]
	if (piece != 0 && (side == 0 || piece / side > 0)) {
		// TODO mb it's an idea to init dragging in some timeout,
		// so that regular click (mousedown and mouseup in ~200ms) won't trigger dragging;
		// and clear that timeout in onmouseup
		dragging = {
			piece,
			square,
			image: images.get(piece),
		}
		selected_piece.square = null
		pctx.clearRect(Math.floor(x / SQ) * SQ, Math.floor(y / SQ) * SQ, SQ, SQ)
		dnd_ctx.drawImage(dragging.image, x - SQ / 2, y - SQ / 2, SQ, SQ)
	}
}

/** @param {MouseEvent} e */
function onmousemove({ offsetX: x, offsetY: y }) {
	if (!dragging) return
	dnd_ctx.clearRect(0, 0, dnd_canvas.width, dnd_canvas.height)
	dnd_ctx.drawImage(dragging.image, x - SQ / 2, y - SQ / 2, SQ, SQ)
}

/** @param {MouseEvent} e */
function onmouseup({ offsetX: x, offsetY: y }) {
	let [file, rank] = get_file_and_rank_for_xy(x, y)
	let square = rank * 8 + file
	if (!dragging) {
		if (selected_piece.square && board[square] / board[selected_piece.square] <= 0) {
			let move = { from: selected_piece.square, to: square }
			let is_legal_move = legal_moves.findIndex(m => m.from == move.from && m.to == move.to) != -1
			if (!is_legal_move) return
			let moved = onmove(move)
			if (moved) {
				// FIXME shouldn't redraw the whole board after move applied
				// FIXME also the board is redrawn in effect
				draw_board()
				selected_piece.square = null
			}
		}
		return
	}

	if (square == dragging.square) {
		draw_piece(pctx, dragging.square, dragging.image)
		dragging = null
		dnd_ctx.clearRect(0, 0, dnd_canvas.width, dnd_canvas.height)
		selected_piece.square = square
		return
	}

	let move = { from: dragging.square, to: square }
	let is_legal_move = legal_moves.findIndex(m => m.from == move.from && m.to == move.to) != -1
	if (is_legal_move) {
		let moved = onmove({ from: dragging.square, to: square })
		if (moved) draw_board() // FIXME shouldn't redraw the whole board after move applied
	}
	draw_piece(pctx, dragging.square, dragging.image)

	dragging = null
	dnd_ctx.clearRect(0, 0, dnd_canvas.width, dnd_canvas.height)
}

/**
 * @param {number} file
 * @param {number} rank
 * @param {string} fill_style
 */
function draw_square(file, rank, fill_style) {
	bctx.fillStyle = fill_style
	bctx.fillRect(file * SQ, rank * SQ, SQ, SQ)
}

/** @param {number} piece */
function load_image_for_piece(piece) {
	let image = new Image()
	return new Promise(resolve => {
		image.onload = () => {
			resolve({ piece, image })
		}
		image.src = get_piece_img_src(piece)
	})
}

function draw_board() {
	for (let s = 0; s < 64; ++s) {
		bctx.fillStyle = square_color(s)
		bctx.fillRect(
			(-ori * Math.floor(s / 8) + 3.5 * (ori + 1)) * SQ,
			((s % 8) * ori - 3.5 * (ori - 1)) * SQ,
			SQ,
			SQ
		)
	}
	// for (let r = 0; r < 8; r++)
	// 	for (let f = 0; f < 8; f++) {
	// 		let s = ori == 1 ? (8 * (7 - r) + f) : (8 * r + (7 - f))
	// 		bctx.fillStyle = square_color(s)
	// 		bctx.fillRect(r * SQ, f * SQ, SQ, SQ)
	// 	}
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} square
 * @param {CanvasImageSource} img
 */
function draw_piece(ctx, square, img) {
	let [file, rank] = get_file_and_rank(square)
	ctx.drawImage(img, file * SQ, rank * SQ, SQ, SQ)
}

// function draw_pawn_promotion(file, rank, color) {
// 	draw_piece(color * Piece.queen)
// }

/**
 * @param {number} square
 * @returns {string}
 */
function square_color(square) {
	return util.dark(square) ? config.colors.dark : config.colors.light
}

/** @param {number} square */
function get_file_and_rank(square) {
	let rank = Math.floor(square / 8)
	let file = square % 8
	if (ori == 1) rank = 7 - rank
	else file = 7 - file
	return [file, rank]
}

/**
 * @param {number} x
 * @param {number} y
 */
function get_file_and_rank_for_xy(x, y) {
	let file = Math.floor(x / SQ)
	let rank = Math.floor(y / SQ)
	if (ori == 1) rank = 7 - rank
	else file = 7 - file
	return [file, rank]
}

/** @param {number} piece */
function get_piece_img_src(piece) {
	let letter = util.get_piece_letter(piece)
	let color = piece > 0 ? 'w' : 'b'
	return `/piece_sets/${piece_set}/${color}${letter}.svg`
}
</script>

<div class="relative">
	<!-- FIXME these z indexes don't work well with other things like board overlay, mb container stuff etc. -->
	<canvas class="z-10 w-full" bind:this={board_canvas} {width} {height}></canvas>
	<canvas class="absolute inset-0 z-20 w-full" bind:this={pieces_canvas} {width} {height}></canvas>
	<canvas class="absolute inset-0 z-30 w-full" bind:this={dnd_canvas} {width} {height}></canvas>
</div>

<style>
canvas {
	user-select: none;
}
</style>
