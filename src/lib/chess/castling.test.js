import { expect, test } from 'vitest'
import { Piece as P, get_king_moves } from './chess.js'
import { Square as S, get_board } from './util.js'

test('white short castling', () => {
	let board = get_board({ e1: P.white_king, h1: P.white_rook })
	let dest_squares = get_king_moves(S.e1, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d1, S.d2, S.e2, S.f2, S.f1, S.g1].sort())
})

test('white long castling', () => {
	let board = get_board({ e1: P.white_king, a1: P.white_rook })
	let dest_squares = get_king_moves(S.e1, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d1, S.d2, S.e2, S.f2, S.f1, S.c1].sort())
})

test('black short castling', () => {
	let board = get_board({ e8: P.black_king, h8: P.black_rook })
	let dest_squares = get_king_moves(S.e8, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d8, S.d7, S.e7, S.f7, S.f8, S.g8].sort())
})

test('black long castling', () => {
	let board = get_board({ e8: P.black_king, a8: P.black_rook })
	let dest_squares = get_king_moves(S.e8, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d8, S.d7, S.e7, S.f7, S.f8, S.c8].sort())
})

test('long castling is impossible if the king is under attack', () => {
	let board = get_board({ e8: P.black_king, a8: P.black_rook, e4: P.white_rook })
	let dest_squares = get_king_moves(S.e8, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d8, S.d7, S.f7, S.f8].sort())
})

test('short castling is impossible if the king is under attack', () => {
	let board = get_board({ e1: P.white_king, h1: P.white_rook, d3: P.black_knight })
	let dest_squares = get_king_moves(S.e1, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d1, S.d2, S.e2, S.f1].sort())
})

test('king may not pass through a square that is under attack', () => {
	let board = get_board({ e1: P.white_king, h1: P.white_rook, f8: P.black_queen })
	let dest_squares = get_king_moves(S.e1, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d1, S.d2, S.e2].sort())

	board = get_board({ e8: P.black_king, a8: P.black_rook, h4: P.white_bishop })
	dest_squares = get_king_moves(S.e8, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d7, S.f7, S.f8].sort())
})

test('king may not end up in a square that is under attack', () => {
	let board = get_board({ e1: P.white_king, a1: P.white_rook, b2: P.black_pawn })
	let dest_squares = get_king_moves(S.e1, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d1, S.d2, S.e2, S.f2, S.f1].sort())

	board = get_board({ e8: P.black_king, h8: P.black_rook, a2: P.white_queen })
	dest_squares = get_king_moves(S.e8, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.d8, S.d7, S.e7, S.f8].sort())
})
