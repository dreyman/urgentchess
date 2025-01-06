import { expect, test } from 'vitest'
import { Piece as P, get_king_moves } from './chess.js'
import { Square as S, get_board } from './util.js'

test('empty board', () => {
	let dest_squares = get_king_moves(S.e4, get_board({ e4: P.white_king })).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.e5, S.d5, S.f5, S.d4, S.f4, S.f3, S.e3, S.d3].sort())

	dest_squares = get_king_moves(S.h8, get_board({ h8: P.black_king })).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.h7, S.g8, S.g7].sort())

	dest_squares = get_king_moves(S.a1, get_board({ a1: P.white_king })).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.a2, S.b1, S.b2].sort())
})

test('captures and blocks', () => {
	let board = get_board({
		e4: P.white_king,
		d4: P.white_pawn,
		f4: P.black_pawn,
		e5: P.white_knight
	})
	let dest_squares = get_king_moves(S.e4, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d5, S.f5, S.f4, S.f3, S.d3].sort())

	board = get_board({
		a5: P.black_king,
		a4: P.black_pawn,
		b4: P.black_pawn,
		b5: P.black_knight,
		a6: P.white_bishop
	})
	dest_squares = get_king_moves(S.a5, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.a6, S.b6].sort())
})

test('blocked: no moves', () => {
	let board = get_board({ h8: P.black_king, h7: P.black_pawn, g7: P.black_pawn, g8: P.black_rook })
	let dest_squares = get_king_moves(S.h8, board).map(m => m.to)
	expect(dest_squares).toMatchObject([])

	board = get_board({
		e1: P.white_king,
		e2: P.white_pawn,
		f2: P.white_pawn,
		d2: P.white_pawn,
		d1: P.white_queen,
		f1: P.white_bishop
	})
	dest_squares = get_king_moves(S.e1, board).map(m => m.to)
	expect(dest_squares).toMatchObject([])
})

test('cannot move to unsafe square', () => {
	// king opposition
	let board = get_board({ e4: P.white_king, e6: P.black_king })
	let dest_squares = get_king_moves(S.e4, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d4, S.f4, S.f3, S.e3, S.d3].sort())

	board = get_board({ a1: P.white_king, h2: P.black_rook })
	dest_squares = get_king_moves(S.a1, board).map(m => m.to)
	expect(dest_squares).toMatchObject([S.b1])

	board = get_board({ a1: P.white_king, h2: P.black_queen })
	dest_squares = get_king_moves(S.a1, board).map(m => m.to)
	expect(dest_squares).toMatchObject([S.b1])

	board = get_board({ e8: P.black_king, d1: P.white_queen })
	dest_squares = get_king_moves(S.e8, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.e7, S.f7, S.f8].sort())

	// white king on e1 & black queen on d3 => king can only move to f2
	board = get_board({ e1: P.white_king, d3: P.black_queen })
	dest_squares = get_king_moves(S.e1, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.f2].sort())

	// wking on e4 & brook on d8 & bqueen on f1 & bbishop on b8 => king can only move to e3
	board = get_board({ e4: P.white_king, d8: P.black_rook, f1: P.black_queen, b8: P.black_bishop })
	dest_squares = get_king_moves(S.e4, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.e3].sort())

	// black king on g8 & white knight on g6 => king cannot move to f8 and h8
	board = get_board({ g8: P.black_king, g6: P.white_knight })
	dest_squares = get_king_moves(S.g8, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.f7, S.g7, S.h7].sort())

	// bking on e8 & wknight on e6 & wrook on h7 => king has no moves
	board = get_board({ e8: P.black_king, e6: P.white_knight, h7: P.white_rook })
	dest_squares = get_king_moves(S.e8, board).map(m => m.to)
	expect(dest_squares).toMatchObject([])

	// white king on d4 & black pawn on d6 & black queen on h3
	board = get_board({ d4: P.white_king, d6: P.black_pawn, h3: P.black_queen })
	dest_squares = get_king_moves(S.d4, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d5, S.e4, S.c4].sort())

	// king has no moves: all surrounding squares are attacked by opposite pieces
	board = get_board({
		e4: P.white_king,
		c6: P.black_pawn,
		f7: P.black_knight,
		c8: P.black_bishop,
		a7: P.black_queen,
		c2: P.black_king,
		g5: P.black_pawn,
		g1: P.black_knight
	})
	dest_squares = get_king_moves(S.e4, board).map(m => m.to)
	expect(dest_squares).toMatchObject([])
})

test('misc: ', () => {
	let board = get_board({
		g1: P.white_king,
		d2: P.black_rook,
		f5: P.black_queen,
		d5: P.black_king
	})
	let dest_squares = get_king_moves(S.g1, board).map(m => m.to)
	expect(dest_squares).toMatchObject([S.h1])
})

test('misc: ', () => {
	let board = get_board({
		a6: P.white_king,
		c7: P.black_queen,
		a4: P.black_pawn,
		a3: P.black_rook
	})
	let dest_squares = get_king_moves(S.a6, board).map(m => m.to)
	expect(dest_squares).toMatchObject([S.b5])
})

test('cannot capture protected piece', () => {
	let board = get_board({ e4: P.white_king, e5: P.black_pawn, d6: P.black_pawn })
	let dest_squares = get_king_moves(S.e4, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d5, S.f5, S.f3, S.e3, S.d3].sort())

	board = get_board({ e4: P.white_king, e5: P.black_pawn, e6: P.black_king })
	dest_squares = get_king_moves(S.e4, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.f3, S.e3, S.d3].sort())
})
