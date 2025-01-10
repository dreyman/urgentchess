import { expect, test } from 'vitest'
import { get_board, Square as S, empty_state, initial_position, apply_move } from './util'
import { Piece as P, create_state, get_moves } from './chess.js'

test('king is in check: can only block', () => {
	let board = get_board({
		g1: P.white_king,
		d3: P.white_queen,
		f2: P.white_pawn,
		g2: P.white_pawn,
		h3: P.white_pawn,
		e1: P.black_rook,
		d6: P.black_queen
	})

	let state = empty_state()
	state.wking = S.g1
	let moves = get_moves(board, state)
	expect(moves.sort()).toMatchObject([{ from: S.d3, to: S.f1 }].sort())
})

test('queen diag mvmnt', () => {
	let board = get_board({
		a1: P.white_rook,
		c3: P.black_king,
		d4: P.white_pawn,
		g4: P.white_queen,
		h4: P.white_king,
		c8: P.black_queen
	})

	let state = empty_state()
	state.wking = S.h4
	state.bking = S.c3
	state.moves = [{ from: S.h3, to: S.h4 }]
	let moves = get_moves(board, state)
	let idx = moves.findIndex(m => m.from == 58 && m.to == 31)
	expect(idx).toBe(-1)
})

test('checkmate => no legal moves', () => {
	let board = initial_position()
	let state = create_state(board, [])
	apply_move({ from: S.f2, to: S.f4 }, board, state)
	apply_move({ from: S.e7, to: S.e6 }, board, state)
	apply_move({ from: S.g2, to: S.g4 }, board, state)
	apply_move({ from: S.d8, to: S.h4 }, board, state)

	let moves = get_moves(board, state)

	expect(moves.length).toBe(0)
})
