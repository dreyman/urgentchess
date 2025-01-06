import { expect, test } from 'vitest'
import { Piece as P, get_queen_moves, get_moves_for } from './chess.js'
import { Square as S, empty_board, get_board } from './util.js'

test('in the center of the empty board', () => {
	let board = empty_board()
	board[S.e4] = P.white_queen

	let moves = get_queen_moves(S.e4, board)
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares.sort()).toMatchObject(
		[
			S.e5,
			S.e6,
			S.e7,
			S.e8,
			S.e3,
			S.e2,
			S.e1,
			S.f4,
			S.g4,
			S.h4,
			S.d4,
			S.c4,
			S.b4,
			S.a4,
			S.f5,
			S.g6,
			S.h7,
			S.d5,
			S.c6,
			S.b7,
			S.a8,
			S.d3,
			S.c2,
			S.b1,
			S.f3,
			S.g2,
			S.h1
		].sort()
	)
})

test('on the last rank on the empty board', () => {
	let board = get_board({
		c8: P.black_queen
	})
	let dest_squares = get_queen_moves(S.c8, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject(
		[
			S.b7,
			S.a6,
			S.d7,
			S.e6,
			S.f5,
			S.g4,
			S.h3,
			S.b8,
			S.a8,
			S.d8,
			S.e8,
			S.f8,
			S.g8,
			S.h8,
			S.c7,
			S.c6,
			S.c5,
			S.c4,
			S.c3,
			S.c2,
			S.c1
		].sort()
	)
})

test('captures and blocks', () => {
	let board = get_board({
		d4: P.black_queen,
		g4: P.black_pawn,
		b4: P.white_pawn,
		d8: P.black_knight,
		d2: P.white_knight,
		g7: P.white_bishop,
		c5: P.black_rook,
		a1: P.black_knight,
		e3: P.white_queen
	})
	let moves = get_queen_moves(S.d4, board)
	let dest_squares = moves.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject(
		[
			S.e4,
			S.f4,
			S.c4,
			S.b4,
			S.d5,
			S.d6,
			S.d7,
			S.d3,
			S.d2,
			S.e5,
			S.f6,
			S.g7,
			S.c3,
			S.b2,
			S.e3
		].sort()
	)
})

test('pinned to file', () => {
	let board = empty_board()
	board[S.d1] = P.white_king
	board[S.d4] = P.white_queen
	board[S.d8] = P.black_queen

	let moves = get_queen_moves(S.d4, board)
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares.sort()).toMatchObject([S.d2, S.d3, S.d5, S.d6, S.d7, S.d8].sort())
})

test('pinned to rank', () => {
	let board = get_board({
		g8: P.white_king,
		d8: P.white_queen,
		b8: P.black_queen
	})

	let moves = get_queen_moves(S.d8, board)
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares.sort()).toMatchObject([S.f8, S.e8, S.c8, S.b8].sort())
})

test('pinned to diagonal e1-a5', () => {
	let board = get_board({
		e1: P.black_king,
		d2: P.black_queen,
		a5: P.white_bishop
	})

	let moves = get_queen_moves(S.d2, board)
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares).toMatchObject([S.c3, S.b4, S.a5])
})

test('pinned to diagonal c1-h6', () => {
	let board = get_board({
		c1: P.white_king,
		e3: P.white_queen,
		g5: P.black_queen
	})
	let moves = get_queen_moves(S.e3, board)
	let dest_squares = moves.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d2, S.f4, S.g5].sort())
})

test('misc: br on e8, wq on e5, bn on e4, wk on e1', () => {
	let board = get_board({
		e1: P.white_king,
		e4: P.black_knight,
		e5: P.white_queen,
		e8: P.black_rook
	})
	let dest_squares = get_queen_moves(S.e5, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject(
		[
			S.e6,
			S.e7,
			S.e8,
			S.e4,
			S.f5,
			S.g5,
			S.h5,
			S.d5,
			S.c5,
			S.b5,
			S.a5,
			S.f6,
			S.g7,
			S.h8,
			S.d6,
			S.c7,
			S.b8,
			S.d4,
			S.c3,
			S.b2,
			S.a1,
			S.f4,
			S.g3,
			S.h2
		].sort()
	)
})

test('the king on e1 is in check: can only capture the queen on e8 or block on e4', () => {
	let board = get_board({
		e1: P.white_king,
		e8: P.black_queen,
		a4: P.white_queen
	})
	let dest_squares = get_moves_for(board, [])
		.filter(m => m.from == S.a4)
		.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.e8, S.e4].sort())
})

test('the king is in check by 2 pieces => cannot capture or block 2 pieces => no moves', () => {
	let board = get_board({
		e1: P.white_king,
		e8: P.black_queen,
		h4: P.black_bishop,
		a4: P.white_queen
	})
	let dest_squares = get_moves_for(board, [])
		.filter(m => m.from == S.a4)
		.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([].sort())
})

test('misc: wr on d1, bq on d4, wn on d6, bk on d8', () => {
	let board = get_board({
		d1: P.white_rook,
		d4: P.black_queen,
		d6: P.white_knight,
		d8: P.black_king
	})
	let dest_squares = get_queen_moves(S.d4, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject(
		[
			S.d3,
			S.d2,
			S.d1,
			S.d5,
			S.d6,
			S.e4,
			S.f4,
			S.g4,
			S.h4,
			S.c4,
			S.b4,
			S.a4,
			S.e3,
			S.f2,
			S.g1,
			S.e5,
			S.f6,
			S.g7,
			S.h8,
			S.c5,
			S.b6,
			S.a7,
			S.c3,
			S.b2,
			S.a1
		].sort()
	)
})
