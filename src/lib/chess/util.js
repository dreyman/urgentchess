import { Piece as P, Color } from './chess.js'
/** @import {GameContext} from './chess.js'; */
/** @import {Move} from './chess.js'; */

/**
 * @returns {number[]}
 */
export function empty_board() {
	return new Array(64).fill(0)
}

/** @returns {GameContext} */
export function empty_context() {
	return {
		moves: [],
		wking: -1,
		bking: -1,
		woo: false,
		wooo: false,
		boo: false,
		booo: false,
		white_in_check: false,
		black_in_check: false
	}
}

/** @returns {number[]} */
export function initial_position() {
	let b = empty_board()
	b[0] = P.white_rook
	b[1] = P.white_knight
	b[2] = P.white_bishop
	b[3] = P.white_queen
	b[4] = P.white_king
	b[5] = P.white_bishop
	b[6] = P.white_knight
	b[7] = P.white_rook
	for (let i = 8; i < 16; i++) b[i] = P.white_pawn
	b[56] = P.black_rook
	b[57] = P.black_knight
	b[58] = P.black_bishop
	b[59] = P.black_queen
	b[60] = P.black_king
	b[61] = P.black_bishop
	b[62] = P.black_knight
	b[63] = P.black_rook
	for (let i = 48; i < 56; i++) b[i] = P.black_pawn
	return b
}

/**
 * @param {Record<string, number>} cfg
 * @returns {number[]}
 */
export function get_board(cfg) {
	let board = empty_board()
	for (const [square, piece] of Object.entries(cfg)) {
		/** @ts-ignore */
		let sq_idx = Square[square]
		board[sq_idx] = piece
	}
	return board
}

/**
 * @param {Move} move
 * @param {number[]} board
 * @param {GameContext} context
 */
export function apply_move(move, board, context) {
	if (board[move.from] > 0) context.white_in_check = false
	else context.black_in_check = false

	// invalidate castling
	if (board[move.from] == P.white_king) {
		context.woo = false
		context.wooo = false
		context.wking = move.to
	} else if (board[move.from] == P.black_king) {
		context.boo = false
		context.booo = false
		context.bking = move.to
	} else if (context.wooo && move.from == 0 && board[move.from] == P.white_rook) {
		context.wooo = false
	} else if (context.woo && move.from == 7 && board[move.from] == P.white_rook) {
		context.woo = false
	} else if (context.booo && move.from == 56 && board[move.from] == P.black_rook) {
		context.booo = false
	} else if (context.boo && move.from == 63 && board[move.from] == P.black_rook) {
		context.boo = false
	}
	// en passant
	let enpassant_sq = get_enpassant_capture_sq(move, board)
	if (enpassant_sq != -1) {
		board[enpassant_sq] = 0
		board[move.to] = board[move.from]
		board[move.from] = 0
		move.capture = true
	}
	// castling
	else if (move.from == S.e1 && move.to == S.g1 && board[move.from] == P.white_king) {
		board[S.f1] = P.white_rook
		board[S.h1] = 0
		board[move.to] = board[move.from]
		board[move.from] = 0
	} else if (move.from == S.e1 && move.to == S.c1 && board[move.from] == P.white_king) {
		board[S.d1] = P.white_rook
		board[S.a1] = 0
		board[move.to] = board[move.from]
		board[move.from] = 0
	} else if (move.from == S.e8 && move.to == S.g8 && board[move.from] == P.black_king) {
		board[S.f8] = P.black_rook
		board[S.h8] = 0
		board[move.to] = board[move.from]
		board[move.from] = 0
	} else if (move.from == S.e8 && move.to == S.c8 && board[move.from] == P.black_king) {
		board[S.d8] = P.black_rook
		board[S.a8] = 0
		board[move.to] = board[move.from]
		board[move.from] = 0
	}
	// pawn promotion
	else if (is_pawn_promotion(move, board)) {
		if (board[move.to] != 0) move.capture = true
		if (move.promotion_piece)
			board[move.to] = move.promotion_piece
		else
			board[move.to] = color(board[move.from]) * P.queen
		board[move.from] = 0
	} else {
		if (board[move.to] != 0) move.capture = true
		board[move.to] = board[move.from]
		board[move.from] = 0
	}

	context.moves.push(move)
}

/**
 * @param {number} square
 * @returns {number}
 */
export function rank(square) {
	return Math.floor(square / 8) + 1
}

/**
 * @param {number} piece
 * @returns {number}
 */
export function color(piece) {
	return piece > 0 ? Color.white : piece < 0 ? Color.black : 0
}

/**
 * @param {number} square [0, 63]
 * @returns {number}
 */
export function dark(square) {
	return (0b1010101001010101 >> (square & 15)) & 0b1
}

/**
 * @param {number} square [0, 63]
 * @returns {boolean}
 */
export function is_dark(square) {
	// 10101010 01010101 10101010 01010101 10101010 01010101 10101010 01010101
	// return s % 2 == Math.floor(s / 8) % 2
	// return (s + Math.floor(s / 8)) % 2 == 0
	return Boolean(dark(square))
}

/**
 * @param {Move} m move
 * @param {number[]} b board
 * @returns {boolean}
 */
export function is_pawn_promotion(m, b) {
	return (
		(b[m.from] == P.white_pawn && rank(m.from) == 7 && rank(m.to) == 8) ||
		(b[m.from] == P.black_pawn && rank(m.from) == 2 && rank(m.to) == 1)
	)
}

/**
 * Returns the square of a pawn captured by en passant move,
 * if provided move is not en passant than returns -1
 * @param {Move} m move
 * @param {number[]} b board
 * @returns {number}
 */
export function get_enpassant_capture_sq(m, b) {
	let p = b[m.from]
	let diff = Math.abs(m.to - m.from)
	let is_diag_1_sq = diff == 7 || diff == 9
	if (
		is_diag_1_sq &&
		((p == P.white_pawn && b[m.to] == 0 && rank(m.from) == 5 && rank(m.to) == 6) ||
			(p == P.black_pawn && b[m.to] == 0 && rank(m.from) == 4 && rank(m.to) == 3))
	) {
		return diff == 9 ? m.from + 1 : m.from - 1
	} else return -1
}

/** @param {number} piece */
export function get_piece_letter(piece) {
	switch (Math.abs(piece)) {
		case P.king:
			return 'K'
		case P.queen:
			return 'Q'
		case P.rook:
			return 'R'
		case P.bishop:
			return 'B'
		case P.knight:
			return 'N'
		case P.pawn:
			return 'P'
		default:
			throw new Error('Unknown piece: ' + piece)
	}
}

/**
 * @param {number} piece
 * @returns {string}
 */
export function piece_name(piece) {
	switch (Math.abs(piece)) {
		case P.pawn:
			return 'pawn'
		case P.rook:
			return 'rook'
		case P.knight:
			return 'knight'
		case P.bishop:
			return 'bishop'
		case P.king:
			return 'king'
		case P.queen:
			return 'queen'
		default:
			return 'unknown'
	}
}

export const Square = {
	a1: 0,
	b1: 1,
	c1: 2,
	d1: 3,
	e1: 4,
	f1: 5,
	g1: 6,
	h1: 7,
	a2: 8,
	b2: 9,
	c2: 10,
	d2: 11,
	e2: 12,
	f2: 13,
	g2: 14,
	h2: 15,
	a3: 16,
	b3: 17,
	c3: 18,
	d3: 19,
	e3: 20,
	f3: 21,
	g3: 22,
	h3: 23,
	a4: 24,
	b4: 25,
	c4: 26,
	d4: 27,
	e4: 28,
	f4: 29,
	g4: 30,
	h4: 31,
	a5: 32,
	b5: 33,
	c5: 34,
	d5: 35,
	e5: 36,
	f5: 37,
	g5: 38,
	h5: 39,
	a6: 40,
	b6: 41,
	c6: 42,
	d6: 43,
	e6: 44,
	f6: 45,
	g6: 46,
	h6: 47,
	a7: 48,
	b7: 49,
	c7: 50,
	d7: 51,
	e7: 52,
	f7: 53,
	g7: 54,
	h7: 55,
	a8: 56,
	b8: 57,
	c8: 58,
	d8: 59,
	e8: 60,
	f8: 61,
	g8: 62,
	h8: 63
}

const S = Square
