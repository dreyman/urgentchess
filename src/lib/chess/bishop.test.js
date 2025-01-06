import { expect, test } from 'vitest'
import { Piece as P, get_bishop_moves } from './chess.js'
import { Square as S, empty_board, get_board } from './util.js'

test('in the center of the empty board', () => {
	let board = empty_board()
	board[S.e4] = P.white_bishop
	let moves = get_bishop_moves(S.e4, board)
	let dest_squares = moves.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject(
		[S.f5, S.g6, S.h7, S.d5, S.c6, S.b7, S.a8, S.d3, S.c2, S.b1, S.f3, S.g2, S.h1].sort()
	)
})

test('in the corner of the empty board', () => {
	let board = get_board({
		a8: P.white_bishop
	})
	let dest_squares = get_bishop_moves(S.a8, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.b7, S.c6, S.d5, S.e4, S.f3, S.g2, S.h1].sort())
})

test('on the last rank on the empty board', () => {
	let board = get_board({
		c8: P.black_bishop
	})
	let dest_squares = get_bishop_moves(S.c8, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.b7, S.a6, S.d7, S.e6, S.f5, S.g4, S.h3].sort())
})

test('captures and blocks', () => {
	let board = get_board({
		e4: P.white_bishop,
		g6: P.black_pawn,
		d5: P.white_knight,
		h1: P.white_queen,
		d3: P.black_bishop
	})
	let moves = get_bishop_moves(S.e4, board)
	let dest_squares = moves.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.f5, S.g6, S.f3, S.g2, S.d3].sort())
})

test('pinned to file', () => {
	let board = get_board({
		a3: P.black_king,
		a4: P.black_bishop,
		a8: P.white_rook
	})
	let moves = get_bishop_moves(S.a4, board)
	let dest_squares = moves.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([].sort())
})

test('pinned to rank', () => {
	let board = get_board({
		a2: P.white_king,
		c2: P.white_bishop,
		f2: P.black_queen
	})
	let moves = get_bishop_moves(S.c2, board)
	let dest_squares = moves.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([].sort())
})

test('pinned to diagonal e8-h5', () => {
	let board = get_board({
		e8: P.black_king,
		g6: P.black_bishop,
		h5: P.white_bishop
	})
	let moves = get_bishop_moves(S.g6, board)
	let dest_squares = moves.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.h5, S.f7].sort())
})

test('pinned to diagonal c1-h6', () => {
	let board = get_board({
		c1: P.white_king,
		e3: P.white_bishop,
		g5: P.black_queen
	})
	let moves = get_bishop_moves(S.e3, board)
	let dest_squares = moves.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d2, S.f4, S.g5].sort())
})

test('misc: bb a8, wb e4, bp f3, wk h1', () => {
	let board = get_board({
		a8: P.black_bishop,
		e4: P.white_bishop,
		f3: P.black_pawn,
		h1: P.white_king
	})
	let dest_squares = get_bishop_moves(S.e4, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject(
		[S.d5, S.c6, S.b7, S.a8, S.f3, S.f5, S.g6, S.h7, S.d3, S.c2, S.b1].sort()
	)
})
