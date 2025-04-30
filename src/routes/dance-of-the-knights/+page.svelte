<script>
import { onMount } from 'svelte'
import Container from '$lib/components/Container.svelte'
import CanvasBoard from '$lib/components/CanvasBoard.svelte'
import { appconfig } from '$lib/app/appconfig.svelte.js'
import * as util from '$lib/chess/util.js'
import { Color, Piece } from '$lib/chess/chess.js'

let INITIAL_SQUARE_WHITE = util.Square.c3
let INITIAL_SQUARE_BLACK = util.Square.e5
let INITIAL_SQUARE_3 = util.Square.e3
let INITIAL_SQUARE_4 = util.Square.c5
let current_sq_white = INITIAL_SQUARE_WHITE
let current_sq_black = INITIAL_SQUARE_BLACK
let current_sq_3 = INITIAL_SQUARE_3
let current_sq_4 = INITIAL_SQUARE_4
let MOVE_INTERVAL = 1250
let board = $state(util.empty_board())
board[INITIAL_SQUARE_WHITE] = Color.white * Piece.knight
board[INITIAL_SQUARE_BLACK] = Color.black * Piece.knight
board[INITIAL_SQUARE_3] = Color.black * Piece.knight
// board[INITIAL_SQUARE_4] = Color.white * Piece.knight
let squares_white = [
	util.Square.d5,
	util.Square.e3,
	util.Square.c4,
	util.Square.e5,
	util.Square.d3,
	util.Square.c5,
	util.Square.e4,
	util.Square.c3,
]
let squares_black = [
	util.Square.d3,
	util.Square.c5,
	util.Square.e4,
	util.Square.c3,
	util.Square.d5,
	util.Square.e3,
	util.Square.c4,
	util.Square.e5,
]
let squares_3 = [
	util.Square.c4,
	util.Square.e5,
	util.Square.d3,
	util.Square.c5,
	util.Square.e4,
	util.Square.c3,
	util.Square.d5,
	util.Square.e3,
]
let squares_4 = [
	util.Square.d3,
	util.Square.e5,
	util.Square.c4,
	util.Square.e3,
	util.Square.d5,
	util.Square.c3,
	util.Square.e4,
	util.Square.c5,
]

onMount(() => {
	let winterval = setInterval(() => {
		let m = next_white_move()
		board[m.to] = board[m.from]
		board[m.from] = 0
		current_sq_white = m.to
	}, MOVE_INTERVAL)

	let binterval = setInterval(() => {
		let m = next_black_move()
		board[m.to] = board[m.from]
		board[m.from] = 0
		current_sq_black = m.to
	}, MOVE_INTERVAL)

	let interval3 = setInterval(() => {
		let m = next_move3()
		board[m.to] = board[m.from]
		board[m.from] = 0
		current_sq_3 = m.to
	}, MOVE_INTERVAL)

	// let interval4 = setInterval(() => {
	// 	let m = next_move4()
	// 	board[m.to] = board[m.from]
	// 	board[m.from] = 0
	// 	current_sq_4 = m.to
	// }, MOVE_INTERVAL)

	return () => {
		clearInterval(winterval)
		clearInterval(binterval)
		clearInterval(interval3)
		// clearInterval(interval4)
	}
})

/** @returns {Move} */
function next_white_move() {
	let idx = squares_white.findIndex(sq => sq == current_sq_white) + 1
	if (idx == squares_white.length) idx = 0
	return {from: current_sq_white, to: squares_white[idx]}
}

/** @returns {Move} */
function next_black_move() {
	let idx = squares_black.findIndex(sq => sq == current_sq_black) + 1
	if (idx == squares_black.length) idx = 0
	return {from: current_sq_black, to: squares_black[idx]}
}

/** @returns {Move} */
function next_move3() {
	let idx = squares_3.findIndex(sq => sq == current_sq_3) + 1
	if (idx == squares_3.length) idx = 0
	return {from: current_sq_3, to: squares_3[idx]}
}

/** @returns {Move} */
function next_move4() {
	let idx = squares_4.findIndex(sq => sq == current_sq_4) + 1
	if (idx == squares_4.length) idx = 0
	return {from: current_sq_4, to: squares_4[idx]}
}
</script>

<Container
	title="Dance of the Knights"
	resize="horizontal"
	minwidth={250}
	width={600}
	left="center"
	top="100px"
>
	<CanvasBoard
		{board}
		orientation={1}
		config={appconfig.board}
		onmove={m => {
			true
		}}
		legal_moves={[]}
	/>
</Container>

<style>
</style>
