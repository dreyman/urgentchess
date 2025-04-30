<script>
import { onMount } from 'svelte'
import Container from '$lib/components/Container.svelte'
import SvgBoard from '$lib/components/SvgBoard.svelte'
import { appconfig } from '$lib/app/appconfig.svelte.js'
import * as util from '$lib/chess/util.js'
import { Color, Piece, knight_squares } from '$lib/chess/chess.js'

let INITIAL_SQUARE = Math.floor(Math.random() * 64)
let current_sq = INITIAL_SQUARE
let color = Color.white
let board = $state(util.empty_board())
board[INITIAL_SQUARE] = color * Piece.knight
// board[current_sq] = color * Piece.knight
/** @type {Move[]} */
let moves = $state([])
// let current_sq = $derived(moves.length == 0 ? 0 : moves[moves.length - 1].to)
let legal_moves = $derived(
	knight_squares(current_sq)
		.filter(sq => !moves.some(m => m.from == sq))
		.map(sq => {
			return { from: current_sq, to: sq }
		})
)
let gameover = $derived(legal_moves.length == 0)
let highlighted_squares = $derived([INITIAL_SQUARE, ...moves.map(m => m.to)])

$effect(() => {
	if (gameover) console.log('GAME OVER')
})

onMount(() => {})

/** @param {Move} move */
function onmove(move) {
	current_sq = move.to
	moves.push(move)
	board[move.to] = board[move.from]
	board[move.from] = 0
	return true
}
</script>

<Container
	title="Knight's Tour"
	resize="horizontal"
	minwidth={250}
	width={600}
	left="center"
	top="100px"
>
	<SvgBoard {board} orientation={1} config={appconfig.board} {onmove} {legal_moves} />
</Container>

<style>
</style>
