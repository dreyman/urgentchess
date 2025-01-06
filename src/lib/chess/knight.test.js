import { expect, test } from 'vitest';
import { Piece as P, get_knight_moves, get_moves_for } from './chess.js';
import { Square as S, get_board } from './util.js';

test('empty board', () => {
	// in the center
	let dest_squares = get_knight_moves(S.d4, get_board({ d4: P.black_knight })).map((m) => m.to);
	expect(dest_squares.sort()).toMatchObject([S.c2, S.e2, S.b3, S.f3, S.e6, S.c6, S.b5, S.f5].sort());

	// in the corner a1
	dest_squares = get_knight_moves(S.a1, get_board({ a1: P.white_knight })).map((m) => m.to);
	expect(dest_squares.sort()).toMatchObject([S.b3, S.c2].sort());

	// in the corner h8
	dest_squares = get_knight_moves(S.h8, get_board({ h8: P.white_knight })).map((m) => m.to);
	expect(dest_squares.sort()).toMatchObject([S.g6, S.f7].sort());
});

test('captures and blocks', () => {
	let board = get_board({
		d4: P.white_knight,
		c2: P.white_pawn, 
		e2: P.black_knight, 
		f3: P.white_pawn,  
		c6: P.black_queen, 
		b5: P.white_knight,
	});

	let moves = get_knight_moves(S.d4, board);
	let dest_squares = moves.map((m) => m.to);

	expect(dest_squares.sort()).toMatchObject([S.e2, S.b3, S.e6, S.c6, S.f5].sort());
});

test('pinned to file', () => {
	let board = get_board({
		a1: P.white_rook,
		a4: P.black_knight,
		a8: P.black_king
	});

	let moves = get_knight_moves(S.a4, board);
	let dest_squares = moves.map((m) => m.to);

	expect(dest_squares).toMatchObject([]);
});

test('pinned to file', () => {
	let board = get_board({
		a5: P.white_rook,
		e5: P.black_knight,
		g5: P.black_king
	});

	let moves = get_knight_moves(S.e5, board);
	let dest_squares = moves.map((m) => m.to);

	expect(dest_squares).toMatchObject([]);
});

test('pinned to diagonal', () => {
	let board = get_board({
		a8: P.white_bishop,
		c5: P.black_knight,
		h1: P.black_king
	});

	let moves = get_knight_moves(S.c6, board);
	let dest_squares = moves.map((m) => m.to);

	expect(dest_squares).toMatchObject([]);
});

test('block check', () => {
	let board = get_board({
		c1: P.white_king,
		c8: P.black_rook,
		e4: P.white_knight
	});
	let dest_squares = get_moves_for(board, []).filter(m => m.from == S.e4).map(m => m.to);
	expect(dest_squares.sort()).toMatchObject([S.c3, S.c5].sort());

	board = get_board({
		a8: P.black_king,
		g2: P.white_bishop,
		c3: P.black_knight
	});
	dest_squares = get_moves_for(board, [{ from: S.f1, to: S.g2 }]).filter(m => m.from == S.c3).map(m => m.to);
	expect(dest_squares.sort()).toMatchObject([S.e4, S.d5].sort());
});

test('capture or block check', () => {
	let board = get_board({
		a4: P.black_rook,
		g4: P.white_king,
		b2: P.white_knight
	});
	let dest_squares = get_moves_for(board, []).filter(m => m.from == S.b2).map(m => m.to);
	expect(dest_squares.sort()).toMatchObject([S.a4, S.c4].sort());
});

test('no moves', () => {
	let board = get_board({
		a4: P.black_rook,
		f6: P.black_knight,
		g4: P.white_king,
		b2: P.white_knight
	});
	let dest_squares = get_moves_for(board, []).filter(m => m.from == S.b2).map(m => m.to);
	expect(dest_squares.sort()).toMatchObject([].sort());
});
