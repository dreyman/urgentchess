<script>
import { onMount } from 'svelte'
import { Piece as P, Color } from '$lib/chess/chess.js'

/** @type {{board: number[], onmove: function(Move):boolean, config: any}} */
let { board, onmove, config } = $props()

/** @type {HTMLCanvasElement} */
let static_canvas
/** @type {HTMLCanvasElement} */
let board_canvas
/** @type {HTMLCanvasElement} */
let pieces_canvas
/** @type {HTMLCanvasElement} */
let dnd_canvas
/** @type {HTMLCanvasElement} */
let dynamic_canvas
/** @type {CanvasRenderingContext2D} */
let bctx
/** @type {CanvasRenderingContext2D} */
let pctx
/** @type {CanvasRenderingContext2D} */
let dnd_ctx
let images = new Map()
let dragging_piece = $state(-1)
/** @type {CanvasImageSource} */
let dragging_piece_img
/** @type {any} */
let dragging = null
/** @type {number | null} */
let selected_piece_sq = null

let selected_piece = {
	/** @type {number | null} */
	_sq: null,
	_file: -1,
	_rank: -1,
	/** @param {number | null} s */
	set square(s) {
		if (this._sq == s) return
		if (this._sq) draw_square(this._file, this._rank)
		this._sq = s
		if (s) {
			this._file = s % 8
			this._rank = Math.floor(s / 8)
			draw_square(this._file, this._rank, config.colors.selected_piece + '80')
		}
	},
	/** @returns {number | null} */
	get square() { return this._sq }
}

let width = 600
let height = 600
let SQ = width / 8
let piece_set = 'merida'
let mounted = $state(false)

let colors = {
	light: '#f0d9b5',
	dark: '#b58863',
}

$effect(() => {
	if (mounted) {
		draw_board()
		pctx.clearRect(0, 0,pieces_canvas.width, pieces_canvas.height)
		for (let s = 0; s < board.length; ++s) {
			if (board[s] != 0) draw_piece(pctx, s, images.get(board[s]))
		}
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
function onmousemove({offsetX: x, offsetY: y}) {
	if (!dragging) return
	dnd_ctx.clearRect(0, 0, dnd_canvas.width, dnd_canvas.height)
	dnd_ctx.drawImage(dragging.image, x - SQ / 2, y - SQ / 2, SQ, SQ)
}

/** @param {MouseEvent} e */
function onmousedown({offsetX: x, offsetY: y}) {
	let file = Math.floor(x / SQ)
	let rank = Math.floor(y / SQ)
	let square = rank * 8 + file
	let piece = board[square]
	if (piece != 0) {
		dragging = {
			piece,
			square,
			image:  images.get(piece),
		}
		selected_piece.square = null
		pctx.clearRect(file * SQ, rank * SQ, SQ, SQ)
		dnd_ctx.drawImage(dragging.image, x - SQ / 2, y - SQ / 2, SQ, SQ)
	}
}

/** @param {MouseEvent} e */
function onmouseup({offsetX: x, offsetY: y}) {
	let file = Math.floor(x / SQ)
	let rank = Math.floor(y / SQ)
	let square = rank * 8 + file
	if (!dragging) {
		if (selected_piece.square && board[square] / board[selected_piece.square] <= 0) {
			let moved = onmove({from: selected_piece.square, to: square})
			if (moved) {
				draw_board() // FIXME shouldn't redraw the whole board after move applied
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

	let moved = onmove({from: dragging.square, to: square})
	if (moved) draw_board() // FIXME shouldn't redraw the whole board after move applied
	draw_piece(pctx, dragging.square, dragging.image)

	dragging = null
	dnd_ctx.clearRect(0, 0, dnd_canvas.width, dnd_canvas.height)
}

/**
 * @param {number} file
 * @param {number} rank
 * @param {string} [fill]
 */
function draw_square(file, rank, fill) {
	if (!fill) fill = (rank + file) % 2 == 0 ? colors.dark : colors.light
	bctx.fillStyle = fill
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
	for (let r = 0; r < 8; r++)
		for (let f = 0; f < 8; f++) {
			bctx.fillStyle = (r + f) % 2 == 0 ? colors.dark : colors.light
			bctx.fillRect(r * SQ, f * SQ, SQ, SQ)
		}
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} square
 * @param {CanvasImageSource} img
 */
function draw_piece(ctx, square, img) {
	let rank = Math.floor(square / 8)
	let file = square % 8
	ctx.drawImage(img, file * SQ, rank * SQ, SQ, SQ)
}

/** @param {number} piece */
function get_piece_img_src(piece) {
	let ltr = get_piece_letter(piece)
	let color = piece > 0 ? 'w' : 'b'
	return `/piece_sets/${piece_set}/${color}${ltr}.svg`
}

/** @param {number} piece */
function get_piece_letter(piece) {
	switch (Math.abs(piece)) {
		case P.king:
			return 'K'
		case P.queen:
			return 'Q'
		case P.rook:
			return 'R'
		case P.bishop:
			return 'B'
		case P.knight:
			return 'N'
		case P.pawn:
			return 'P'
	}
}
</script>

<canvas class="w-full z-10" bind:this={board_canvas} {width} {height}></canvas>
<canvas class="w-full z-20 absolute inset-0" bind:this={pieces_canvas} {width} {height}></canvas>
<canvas class="w-full z-30 absolute inset-0" bind:this={dnd_canvas} {width} {height}></canvas>

<style>
</style>
