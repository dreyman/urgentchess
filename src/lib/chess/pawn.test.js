import { expect, test } from 'vitest'
import { get_pawn_moves, Piece as P } from './chess.js'
import { Square as S, get_board } from './util.js'

test('white pawn at starting position: one-square and two-square moves possible', () => {
	let dest_squares = get_pawn_moves(S.e2, get_board({ e2: P.white_pawn })).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.e3, S.e4].sort())
})

test('black pawn at starting position: one-square and two-square moves possible', () => {
	let dest_squares = get_pawn_moves(S.h7, get_board({ h7: P.black_pawn })).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.h6, S.h5].sort())
})

test('white pawn at e5: only one-square move forward is possible', () => {
	let dest_squares = get_pawn_moves(S.e5, get_board({ e5: P.white_pawn })).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.e6].sort())
})

test('black pawn at b4: only one-square move forward is possible', () => {
	let dest_squares = get_pawn_moves(S.b4, get_board({ e5: P.black_pawn })).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.b3].sort())
})

test('blocked pawn: no moves available', () => {
	let dest_squares = get_pawn_moves(S.e4, get_board({ e4: P.white_pawn, e5: P.black_pawn })).map(
		m => m.to
	)
	expect(dest_squares).toMatchObject([])

	dest_squares = get_pawn_moves(S.b5, get_board({ b5: P.black_pawn, b4: P.white_knight })).map(
		m => m.to
	)
	expect(dest_squares).toMatchObject([])
})

test('pawn capture', () => {
	let dest_squares = get_pawn_moves(S.e4, get_board({ e4: P.white_pawn, d5: P.black_pawn })).map(
		m => m.to
	)
	expect(dest_squares.sort()).toMatchObject([S.d5, S.e5].sort())

	dest_squares = get_pawn_moves(S.d5, get_board({ d5: P.black_pawn, e4: P.white_pawn })).map(
		m => m.to
	)
	expect(dest_squares.sort()).toMatchObject([S.d4, S.e4].sort())
})

test('white pawn: en passant', () => {
	let dest_squares = get_pawn_moves(S.e5, get_board({ e5: P.white_pawn, d5: P.black_pawn }), {
		from: S.d7,
		to: S.d5
	}).map(m => m.to)
	expect(dest_squares).toMatchObject([S.e6, S.d6])

	dest_squares = get_pawn_moves(
		S.g5,
		get_board({ g5: P.white_pawn, h5: P.black_pawn, f5: P.black_pawn }),
		{
			from: S.h7,
			to: S.h5
		}
	).map(m => m.to)
	expect(dest_squares).toMatchObject([S.g6, S.h6])

	dest_squares = get_pawn_moves(S.a5, get_board({ a5: P.white_pawn, h5: P.black_pawn }), {
		from: S.h7,
		to: S.h5
	}).map(m => m.to)
	expect(dest_squares).toMatchObject([S.a6])

	dest_squares = get_pawn_moves(S.h5, get_board({ h5: P.white_pawn, a5: P.black_pawn }), {
		from: S.a7,
		to: S.a5
	}).map(m => m.to)
	expect(dest_squares).toMatchObject([S.h6])

	dest_squares = get_pawn_moves(S.h4, get_board({ h4: P.white_pawn, a5: P.black_pawn }), {
		from: S.a7,
		to: S.a5
	}).map(m => m.to)
	expect(dest_squares).toMatchObject([S.h5])
})

test('black pawn: en passant', () => {
	let dest_squares = get_pawn_moves(S.e4, get_board({ e4: P.black_pawn, d4: P.white_pawn }), {
		from: S.d2,
		to: S.d4
	}).map(m => m.to)
	expect(dest_squares).toMatchObject([S.e3, S.d3])

	dest_squares = get_pawn_moves(
		S.b4,
		get_board({ b4: P.black_pawn, a4: P.white_pawn, c4: P.white_pawn }),
		{
			from: S.c2,
			to: S.c4
		}
	).map(m => m.to)
	expect(dest_squares).toMatchObject([S.b3, S.c3])

	// en passant and regular capture
	dest_squares = get_pawn_moves(
		S.b4,
		get_board({ b4: P.black_pawn, a3: P.white_queen, c3: P.white_pawn }),
		{
			from: S.c2,
			to: S.c4
		}
	).map(m => m.to)
	expect(dest_squares).toMatchObject([S.b3, S.c3, S.a3])

	dest_squares = get_pawn_moves(S.a5, get_board({ a5: P.black_pawn, h4: P.white_pawn }), {
		from: S.h2,
		to: S.h4
	}).map(m => m.to)
	expect(dest_squares).toMatchObject([S.a4])
})

test('pinned to file', () => {
	let board = get_board({
		e1: P.white_king,
		e4: P.white_pawn,
		e7: P.black_rook,
		d5: P.black_queen,
		f5: P.black_pawn
	})

	let moves = get_pawn_moves(S.e4, board)
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares).toMatchObject([S.e5])
})

test('pinned to file: en passant capture is not possible', () => {
	let board = get_board({
		e1: P.white_king,
		e5: P.white_pawn,
		d5: P.black_pawn,
		e8: P.black_queen
	})

	let moves = get_pawn_moves(S.e5, board, { from: S.d7, to: S.d5 })
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares).toMatchObject([S.e6])
})

test('br|-|-|bp|wp|-|-|wk - cannot capture en passant because white king will be exposed to black rook', () => {
	let board = get_board({
		e5: P.white_pawn,
		h5: P.white_king,
		a5: P.black_rook,
		d5: P.black_pawn
	})

	let moves = get_pawn_moves(S.e5, board, { from: S.d7, to: S.d5 })
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares).toMatchObject([S.e6])
})

test('wq|-|-|bp|wp|-|-|bk - cannot capture en passant because black king will be exposed to white queen', () => {
	let board = get_board({
		e4: P.white_pawn,
		h4: P.black_king,
		a4: P.white_queen,
		d4: P.black_pawn
	})

	let moves = get_pawn_moves(S.d4, board, { from: S.e2, to: S.e4 })
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares).toMatchObject([S.d3])
})

test('pawn is pinned to rank no moves available', () => {
	let board = get_board({
		a4: P.white_queen,
		e4: P.black_pawn,
		h4: P.black_king,
		d5: P.white_bishop,
		f5: P.white_knight
	})

	let moves = get_pawn_moves(S.e4, board)
	let dest_squares = moves.map(m => m.to)

	expect(dest_squares).toMatchObject([])
})

test('pinned to diagonal', () => {
	let dest_squares = get_pawn_moves(
		S.e4,
		get_board({ e4: P.white_pawn, d3: P.white_king, g6: P.black_bishop })
	).map(m => m.to)
	expect(dest_squares).toMatchObject([])

	dest_squares = get_pawn_moves(
		S.e5,
		get_board({ e5: P.black_pawn, d4: P.white_pawn, f4: P.white_queen, c7: P.black_king })
	).map(m => m.to)
	expect(dest_squares).toMatchObject([S.f4])

	// no en passant
	dest_squares = get_pawn_moves(
		S.e5,
		get_board({ e5: P.white_pawn, d5: P.black_pawn, h8: P.black_bishop, a1: P.white_king }),
		{ from: S.d7, to: S.d5 }
	).map(m => m.to)
	expect(dest_squares).toMatchObject([])

	// no en passant
	dest_squares = get_pawn_moves(
		S.f4,
		get_board({ f4: P.black_pawn, h2: P.white_queen, b8: P.black_king, e4: P.white_pawn }),
		{ from: S.e2, to: S.e4 }
	).map(m => m.to)
	expect(dest_squares).toMatchObject([])
})

test('misc', () => {
	let board = get_board({
		e1: P.white_king,
		c3: P.white_pawn,
		h5: P.black_bishop
	})
	let dest_squares = get_pawn_moves(S.c3, board).map(m => m.to)
	expect(dest_squares.sort()).toMatchObject([S.c4].sort())
})
