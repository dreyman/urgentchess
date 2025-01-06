import { expect, test } from 'vitest'
import { Piece as P, get_moves_for, get_rook_moves } from './chess.js'
import { Square as S, empty_board, get_board } from './util.js'

test('in the center of the empty board', () => {
	let board = empty_board()
	board[S.e4] = P.white_rook

	let moves = get_rook_moves(S.e4, board)
	let dest_squares = moves.map(m => m.to)

	expect(moves.length).toBe(14)
	expect(dest_squares.sort()).toMatchObject(
		[S.e5, S.e6, S.e7, S.e8, S.e3, S.e2, S.e1, S.f4, S.g4, S.h4, S.d4, S.c4, S.b4, S.a4].sort()
	)
})

test('captures and blocked', () => {
	let board = get_board({
		e4: P.white_rook,
		e7: P.black_pawn,
		e2: P.white_pawn,
		d4: P.white_queen,
		g4: P.black_knight
	})

	let moves = get_rook_moves(S.e4, board)
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares.sort()).toMatchObject([S.e5, S.e6, S.e7, S.e3, S.f4, S.g4].sort())
})

test('pinned to file', () => {
	let board = empty_board()
	board[S.d4] = P.white_rook
	board[S.d8] = P.black_queen
	board[S.d1] = P.white_king

	let moves = get_rook_moves(S.d4, board)
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares.sort()).toMatchObject([S.d5, S.d6, S.d7, S.d8, S.d3, S.d2].sort())
})

test('pinned to rank', () => {
	let board = get_board({
		d1: P.white_rook,
		g1: P.white_king,
		b1: P.black_queen
	})

	let moves = get_rook_moves(S.d1, board)
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares.sort()).toMatchObject([S.f1, S.e1, S.c1, S.b1].sort())
})

test('pinned to diagonal a1-h8', () => {
	let board = get_board({
		d4: P.white_rook,
		c3: P.white_king,
		e5: P.black_bishop
	})

	let moves = get_rook_moves(S.d4, board)
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares).toMatchObject([])
})

test('misc: br on e8, wr on e5, bn on e4, wk on e1', () => {
	let board = get_board({
		e1: P.white_king,
		e4: P.black_knight,
		e5: P.white_rook,
		e8: P.black_rook
	})
	let dest_squares = get_rook_moves(S.e5, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject(
		[S.e6, S.e7, S.e8, S.e4, S.f5, S.g5, S.h5, S.d5, S.c5, S.b5, S.a5].sort()
	)
})

test('the king on e1 is in check: can only block on e4', () => {
	let board = get_board({
		e1: P.white_king,
		e8: P.black_queen,
		a4: P.white_rook
	})
	let dest_squares = get_moves_for(board, [])
		.filter(m => m.from == S.a4)
		.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.e4].sort())
})

test('the king on g8 is in check: can only capture bishop on a2', () => {
	let board = get_board({
		g8: P.black_king,
		a2: P.white_bishop,
		g2: P.black_rook
	})
	let dest_squares = get_moves_for(board, [{ from: S.b1, to: S.a2 }])
		.filter(m => m.from == S.g2)
		.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.a2].sort())
})

test('the king is in check by 2 pieces => cannot capture or block 2 pieces => no moves', () => {
	let board = get_board({
		e1: P.white_king,
		e8: P.black_queen,
		h4: P.black_bishop,
		a4: P.white_rook
	})
	let dest_squares = get_moves_for(board, [])
		.filter(m => m.from == S.a4)
		.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([].sort())
})

test('the king on g8 is in check & pinned to g rank: cannot capture bishop on a2', () => {
	let board = get_board({
		g8: P.black_king,
		a2: P.white_bishop,
		g2: P.black_rook,
		g1: P.white_rook
	})
	let dest_squares = get_moves_for(board, [{ from: S.b1, to: S.a2 }])
		.filter(m => m.from == S.g2)
		.map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([].sort())
})

test('misc: wr on a4, br on b4, wb on c4, bk on d4', () => {
	let board = get_board({
		a4: P.white_rook,
		b4: P.black_rook,
		c4: P.white_bishop,
		d4: P.black_king
	})
	let dest_squares = get_rook_moves(S.b4, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject(
		[S.a4, S.c4, S.b3, S.b2, S.b1, S.b5, S.b6, S.b7, S.b8].sort()
	)
})

test('misc: wr f4, br h4, wp f5, wp f3, wp, e4', () => {
	let board = get_board({
		f4: P.white_rook,
		h4: P.black_rook,
		f5: P.white_pawn,
		f3: P.white_pawn,
		e4: P.white_pawn
	})
	let dest_squares = get_rook_moves(S.f4, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.g4, S.h4].sort())
})
