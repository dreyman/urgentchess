// Obtuse chess rules implementation
// Uses one dimensional integer array for the board state
// board[x] == 0 - empty square
// board[x] < 0 - black piece
// board[x] > 0 - white piece

// TODO add assertions for random game testing

export const Color = {
	white: 1,
	black: -1
}

/** @type {Record<string, number>} */
export const Piece = {
	pawn: 1,
	rook: 2,
	knight: 3,
	bishop: 4,
	king: 5,
	queen: 6
	// white_pawn: 1,
	// white_rook: 2,
	// white_knight: 3,
	// white_bishop: 4,
	// white_king: 5,
	// white_queen: 6,
	// black_pawn: -1,
	// black_rook: -2,
	// black_knight: -3,
	// black_bishop: -4,
	// black_king: -5,
	// black_queen: -6
}
Piece.white_pawn = Color.white * Piece.pawn
Piece.black_pawn = Color.black * Piece.pawn
Piece.white_rook = Color.white * Piece.rook
Piece.black_rook = Color.black * Piece.rook
Piece.white_bishop = Color.white * Piece.bishop
Piece.black_bishop = Color.black * Piece.bishop
Piece.white_knight = Color.white * Piece.knight
Piece.black_knight = Color.black * Piece.knight
Piece.white_queen = Color.white * Piece.queen
Piece.black_queen = Color.black * Piece.queen
Piece.white_king = Color.white * Piece.king
Piece.black_king = Color.black * Piece.king

// /**
//  * @typedef {0|1|2|3|4|5|6|7|8|9|10} Square
//  */

// /**
//  * @typedef {Piece|0[]} Board
//  */

// /**
//  * @typedef {-6|-5|-4|-3|-2|-1|1|2|3|4|5|6} Piece
//  */

/**
 * @typedef {Object} Scope
 * @property {Record<string, number>} [rank]
 * @property {Record<string, number>} [file]
 * @property {Record<string, number>} [diag]
 * @property {number} [square]
 * @property {boolean} [escape]
 */

/**
 * @typedef {Object} Move
 * @property {number} from
 * @property {number} to
 * @property {boolean | undefined} capture
 */

/**
 * @typedef {Object} GameState
 * @property {boolean} woo white short castling
 * @property {boolean} wooo white long castling
 * @property {boolean} boo black short castling
 * @property {boolean} booo black long castling
 * @property {Move[]} moves
 * @property {number} wking white king square
 * @property {number} bking black king square
 * @property {boolean} white_in_check
 * @property {boolean} black_in_check
 */

/**
 * @param {number[]} board
 * @param {Move[]} previous_moves
 * @returns {Move[]}
 */
export function get_moves_for(board, previous_moves) {
	return get_moves(board, create_state(board, previous_moves))
}

/**
 * @param {number[]} board
 * @param {Move[]} moves
 * @returns {GameState}
 */
export function create_state(board, moves) {
	let woo = true,
		wooo = true,
		boo = true,
		booo = true
	moves.forEach(m => {
		if (m.from == 4) woo = wooo = false
		if (m.from == 7) woo = false
		if (m.from == 0) woo = false
		if (m.from == 60) boo = booo = false
		if (m.from == 63) boo = false
		if (m.from == 56) boo = false
	})
	let wking = board.findIndex(p => p == Piece.white_king)
	let bking = board.findIndex(p => p == Piece.black_king)
	let white_in_check = wking != -1 && !safe(wking, board, Color.white)
	let black_in_check = bking != -1 && !safe(bking, board, Color.black)
	return {
		moves,
		wking,
		bking,
		white_in_check,
		black_in_check,
		woo,
		wooo,
		boo,
		booo
	}
}

/**
 * @param {number[]} board
 * @param {GameState} state
 * @returns {Move[]}
 */
export function get_moves(board, state) {
	let white_to_move = state.moves.length % 2 == 0
	let color = white_to_move ? Color.white : Color.black
	let last_move = state.moves.length > 0 ? state.moves[state.moves.length - 1] : null
	let king_sq = color == Color.white ? state.wking : state.bking
	let scope = null
	let castling_short = color == Color.white ? state.woo : state.boo
	let castling_long = color == Color.white ? state.wooo : state.booo
	if (king_sq != -1) {
		scope = get_scope(king_sq, board)
		if (scope != null) {
			state.white_in_check = color == Color.white
			state.black_in_check = color == Color.black
			if (scope.escape) return get_king_moves(king_sq, board, castling_short, castling_long)
		}
	}
	/** @type {Move[]} */
	let moves = []
	for (let sq = 0; sq < board.length; ++sq) {
		if (board[sq] == 0 || (white_to_move && board[sq] < 0) || (!white_to_move && board[sq] > 0))
			continue
		switch (Math.abs(board[sq])) {
			case Piece.pawn:
				moves = moves.concat(get_pawn_moves(sq, board, last_move, scope ?? {}))
				break
			case Piece.rook:
				moves = moves.concat(get_rook_moves(sq, board, scope ?? {}))
				break
			case Piece.knight:
				moves = moves.concat(get_knight_moves(sq, board, scope ?? {}))
				break
			case Piece.bishop:
				moves = moves.concat(get_bishop_moves(sq, board, scope ?? {}))
				break
			case Piece.king:
				moves = moves.concat(get_king_moves(sq, board, castling_short, castling_long))
				break
			case Piece.queen:
				moves = moves.concat(get_queen_moves(sq, board, scope ?? {}))
				break
		}
	}
	return moves
}

/**
 * @param {number} sq - square where king is positioned
 * @param {number[]} b board
 * @param {Move[]} previous_moves
 * @returns {Move[]}
 */
export function get_king_moves_for(sq, b, previous_moves) {
	let color = b[sq] > 0 ? Color.white : Color.black
	let oo = true
	let ooo = true
	if (color == Color.white) {
		previous_moves.forEach(m => {
			if (m.from == 4) oo = ooo = false
			if (m.from == 7) oo = false
			if (m.from == 0) ooo = false
		})
	} else {
		previous_moves.forEach(m => {
			if (m.from == 60) oo = ooo = false
			if (m.from == 63) oo = false
			if (m.from == 56) ooo = false
		})
	}
	return get_king_moves(sq, b, oo, ooo)
}

/**
 * @param {number} sq - square where king is positioned
 * @param {number[]} b board
 * @param {boolean} oo short castling
 * @param {boolean} ooo long castling
 * @returns {Move[]}
 */
export function get_king_moves(sq, b, oo = true, ooo = true) {
	/** @type {Move[]} */
	let moves = []
	let color = b[sq] > 0 ? Color.white : Color.black
	let destinations = king_squares(sq)
	destinations.forEach(dest => {
		if (empty_or_capture(b[dest], color) && safe(dest, b, color)) moves.push({ from: sq, to: dest })
	})
	// castling
	if (color == Color.white && sq == 4) {
		// short castling
		if (
			oo &&
			b[5] == 0 &&
			b[6] == 0 &&
			b[7] == Piece.white_rook &&
			safe(sq, b, color) &&
			safe(5, b, color) &&
			safe(6, b, color)
		) {
			moves.push({ from: 4, to: 6 })
		}
		// long castling
		if (
			ooo &&
			b[3] == 0 &&
			b[2] == 0 &&
			b[1] == 0 &&
			b[0] == Piece.white_rook &&
			safe(sq, b, color) &&
			safe(3, b, color) &&
			safe(2, b, color)
		) {
			moves.push({ from: 4, to: 2 })
		}
	} else if (color == Color.black && sq == 60) {
		// short castling
		if (
			oo &&
			b[61] == 0 &&
			b[62] == 0 &&
			b[63] == Piece.black_rook &&
			safe(sq, b, color) &&
			safe(61, b, color) &&
			safe(62, b, color)
		) {
			moves.push({ from: 60, to: 62 })
		}
		// long castling
		if (
			ooo &&
			b[59] == 0 &&
			b[58] == 0 &&
			b[57] == 0 &&
			b[56] == Piece.black_rook &&
			safe(sq, b, color) &&
			safe(59, b, color) &&
			safe(58, b, color)
		) {
			moves.push({ from: 60, to: 58 })
		}
	}
	return moves
}

/**
 * Returns false if the given square is reachable by any opposite color piece
 * Otherwise, returns true
 * @param {number} sq square
 * @param {number[]} b board
 * @param {number} color
 * @returns {boolean}
 */
export function safe(sq, b, color) {
	let opposite = -color
	// opposite king is around the given square
	let king_sqs = king_squares(sq)
	let opposite_king = king_sqs.findIndex(sq => b[sq] == opposite * Piece.king)
	if (opposite_king != -1) return false

	// the given square is reachable by opposite queen, rook or bishop
	if (
		find_next_in_rank(sq, b, opposite * Piece.rook, opposite * Piece.queen) != -1 ||
		find_next_in_file(sq, b, opposite * Piece.rook, opposite * Piece.queen) != -1 ||
		find_next_on_diagonal(sq, b, opposite * Piece.bishop, opposite * Piece.queen) != -1
	) {
		return false
	}

	// the given square is reachable by opposite knight
	let knight_sqs = knight_squares(sq)
	let opposite_knight = knight_sqs.findIndex(sq => b[sq] == opposite * Piece.knight)
	if (opposite_knight != -1) return false

	// the given square is attacked by opposite pawn
	let opposite_pawn = opposite * Piece.pawn

	if (
		color == Color.white &&
		((sq % 8 != 0 && b[sq + 7] == opposite_pawn) || (sq % 8 != 7 && b[sq + 9] == opposite_pawn))
	)
		return false
	else if (
		color == Color.black &&
		((sq % 8 != 7 && b[sq - 7] == opposite_pawn) || (sq % 8 != 0 && b[sq - 9] == opposite_pawn))
	) {
		return false
	}

	return true
}

/**
 * @param {number} sq square
 * @param {number[]} b board
 * @returns {Scope | null}
 */
export function get_scope(sq, b) {
	let color = b[sq] > 0 ? Color.white : Color.black
	let opposite = -color
	let scope = null

	let checked_by = find_next_in_rank(sq, b, opposite * Piece.rook, opposite * Piece.queen)
	if (checked_by != -1) {
		if (checked_by < sq) scope = { rank: { from: checked_by, to: sq - 1 } }
		else scope = { rank: { from: sq + 1, to: checked_by } }
	}
	checked_by = find_next_in_file(sq, b, opposite * Piece.rook, opposite * Piece.queen)
	if (checked_by != -1) {
		if (scope != null) return { escape: true }
		if (checked_by < sq) scope = { file: { from: checked_by, to: sq - 8 } }
		else scope = { file: { from: sq + 8, to: checked_by } }
	}
	checked_by = find_next_on_diagonal(sq, b, opposite * Piece.bishop, opposite * Piece.queen)
	if (checked_by != -1) {
		if (scope != null) return { escape: true }
		let diag = (sq - checked_by) % 9 == 0 ? 9 : 7
		if (checked_by < sq) scope = { diag: { from: checked_by, to: sq - diag } }
		else scope = { diag: { from: sq + diag, to: checked_by } }
	}

	let knight_sqs = knight_squares(sq)
	for (let i = 0; i < knight_sqs.length; ++i) {
		if (b[knight_sqs[i]] == opposite * Piece.knight) {
			if (scope != null) return { escape: true }
			scope = { square: knight_sqs[i] }
			// it's impossible to be checked by more than one knight at the same time, so no need to check further
			break
		}
	}

	let opposite_pawn = opposite * Piece.pawn
	if (color == Color.white) {
		if (sq % 8 != 0 && b[sq + 7] == opposite_pawn) {
			if (scope != null) return { escape: true }
			scope = { square: sq + 7 }
		}
		if (sq % 8 != 7 && b[sq + 9] == opposite_pawn) {
			if (scope != null) return { escape: true }
			scope = { square: sq + 9 }
		}
	} else {
		if (sq % 8 != 7 && b[sq - 7] == opposite_pawn) {
			if (scope != null) return { escape: true }
			scope = { square: sq - 7 }
		}
		if (sq % 8 != 0 && b[sq - 9] == opposite_pawn) {
			if (scope != null) return { escape: true }
			scope = { square: sq - 9 }
		}
	}

	return scope
}

/**
 * @param {number} sq square
 * @param {number[]} b board
 * @param {number} piece
 * @param {number} piece2 - optional
 * @returns {number} square
 */
function find_next_on_diagonal(sq, b, piece, piece2 = 69) {
	// FIXME get rid of skip king hack
	let color = piece > 0 ? Color.black : Color.white
	if (sq % 8 != 7) {
		let s = sq + 9
		while (s < 56 && s % 8 != 7 && (b[s] == 0 || b[s] == color * Piece.king)) s += 9
		if (b[s] == piece || b[s] == piece2) return s

		s = sq - 7
		while (s > 7 && s % 8 != 7 && (b[s] == 0 || b[s] == color * Piece.king)) s -= 7
		if (b[s] == piece || b[s] == piece2) return s
	}
	if (sq % 8 != 0) {
		let s = sq - 9
		while (s > 7 && s % 8 != 0 && (b[s] == 0 || b[s] == color * Piece.king)) s -= 9
		if (b[s] == piece || b[s] == piece2) return s

		s = sq + 7
		while (s < 56 && s % 8 != 0 && (b[s] == 0 || b[s] == color * Piece.king)) s += 7
		if (b[s] == piece || b[s] == piece2) return s
	}
	return -1
}

/**
 * @param {number} sq square
 * @param {number[]} b board
 * @param {number} piece
 * @param {number} piece2 - optional
 * @returns {number} square
 */
function find_next_in_rank(sq, b, piece, piece2 = 69) {
	// FIXME get rid of skip king hack
	let color = piece > 0 ? Color.black : Color.white
	if (sq % 8 != 0) {
		let s = sq - 1
		while (s % 8 != 0 && (b[s] == 0 || b[s] == color * Piece.king)) s--
		if (b[s] == piece || b[s] == piece2) return s
	}
	if (sq % 8 != 7) {
		let s = sq + 1
		while (s % 8 != 7 && (b[s] == 0 || b[s] == color * Piece.king)) s++
		if (b[s] == piece || b[s] == piece2) return s
	}

	return -1
}

/**
 * @param {number} sq square
 * @param {number[]} b board
 * @param {number} piece
 * @param {number} piece2 - optional
 * @returns {number} square
 */
function find_next_in_file(sq, b, piece, piece2 = 69) {
	// FIXME get rid of skip king hack
	let color = piece > 0 ? Color.black : Color.white
	let s = sq - 8
	while (s > 7 && (b[s] == 0 || b[s] == color * Piece.king)) s -= 8
	if (b[s] == piece || b[s] == piece2) return s

	s = sq + 8
	while (s < 56 && (b[s] == 0 || b[s] == color * Piece.king)) s += 8
	if (b[s] == piece || b[s] == piece2) return s

	return -1
}

/**
 * @param {number} sq square
 * @returns {number[]}
 */
function king_squares(sq) {
	// FIXME should be optimized: get rid of .filter, handle board boundaries in if's
	let destinations = []
	if (sq % 8 == 0) destinations = [sq + 8, sq + 9, sq + 1, sq - 7, sq - 8]
	else if (sq % 8 == 7) destinations = [sq + 8, sq + 7, sq - 1, sq - 9, sq - 8]
	else destinations = [sq + 1, sq - 1, sq + 8, sq - 8, sq + 9, sq - 7, sq - 9, sq + 7]
	return destinations.filter(sq => sq < 64 && sq >= 0)
}

/**
 * @param {number} sq square
 * @returns {number[]}
 */
function knight_squares(sq) {
	let squares = []
	let dest = sq + 10
	if (dest < 64 && sq % 8 != 7 && (sq + 2) % 8 != 0) squares.push(dest)
	dest = sq + 6
	if (dest < 64 && sq % 8 != 0 && (sq - 1) % 8 != 0) squares.push(dest)
	dest = sq - 6
	if (dest >= 0 && sq % 8 != 7 && (sq + 2) % 8 != 0) squares.push(dest)
	dest = sq - 10
	if (dest >= 0 && sq % 8 != 0 && (sq - 1) % 8 != 0) squares.push(dest)
	dest = sq + 17
	if (dest < 64 && sq % 8 != 7) squares.push(dest)
	dest = sq + 15
	if (dest < 64 && sq % 8 != 0) squares.push(dest)
	dest = sq - 15
	if (dest >= 0 && sq % 8 != 7) squares.push(dest)
	dest = sq - 17
	if (dest >= 0 && sq % 8 != 0) squares.push(dest)
	return squares
}

/**
 * @param {number} sq1
 * @param {number} sq2
 * @returns {boolean}
 */
export function same_rank(sq1, sq2) {
	return Math.abs(sq1 - sq2) < 8 && Math.floor(sq1 / 8) == Math.floor(sq2 / 8)
}

/**
 * @param {number} sq1
 * @param {number} sq2
 * @returns {boolean}
 */
export function same_diagonal(sq1, sq2) {
	;[sq1, sq2] = [Math.min(sq1, sq2), Math.max(sq1, sq2)]
	return (
		((sq1 - sq2) % 9 == 0 && (sq1 - sq2) / 9 == Math.floor(sq1 / 8) - Math.floor(sq2 / 8)) ||
		((sq1 - sq2) % 7 == 0 && (sq1 - sq2) / 7 == Math.floor(sq1 / 8) - Math.floor(sq2 / 8))
	)
}

/**
 * @param {number} sq1
 * @param {number} sq2
 * @returns {boolean}
 */
export function same_file(sq1, sq2) {
	return sq1 % 8 == sq2 % 8
}

/**
 * @param {number} sq
 * @param {number[]} b board
 * @returns {boolean}
 */
export function rank_pin(sq, b) {
	if (Math.abs(b[sq]) == Piece.king) return false
	let color = b[sq] > 0 ? Color.white : Color.black
	let king_sq = b.findIndex(sq => sq == Piece.king * color)
	if (king_sq == -1 || !same_rank(sq, king_sq)) return false
	// check if there are no pieces between the given square and the king
	let k = sq > king_sq ? -1 : 1
	let s = sq + k
	// checking [0, 64] boundaries is not necessary here, just checking for now to avoid infite loop if there's a bug
	while (s != king_sq && s >= 0 && s < 64) {
		if (b[s] != 0) return false
		s += k
	}

	if (sq < king_sq) {
		// qr p k
		let s = sq - 1
		while (b[s] == 0 && s % 8 != 0) s--
		if (b[s] == -color * Piece.queen || b[s] == -color * Piece.rook) return true
	} else {
		// k p qr
		let s = sq + 1
		while (b[s] == 0 && s % 8 != 7) s++
		if (b[s] == -color * Piece.queen || b[s] == -color * Piece.rook) return true
	}
	return false
}

/**
 * @param {number} sq
 * @param {number[]} b board
 * @returns {boolean}
 */
export function file_pin(sq, b) {
	if (Math.abs(b[sq]) == Piece.king) return false
	let color = b[sq] > 0 ? Color.white : Color.black
	let opposite = -color
	let king_sq = b.findIndex(sq => sq == Piece.king * color)
	if (king_sq == -1 || !same_file(sq, king_sq)) return false
	// check if there are no pieces between the given square and the king
	let k = sq > king_sq ? -8 : 8
	let s = sq + k
	// checking [0, 64] boundaries is not necessary here, just checking for now to avoid infite loop if there's a bug
	while (s != king_sq && s >= 0 && s < 64) {
		if (b[s] != 0) return false
		s += k
	}

	if (sq > king_sq) {
		// qr p k
		let s = sq + 8
		while (b[s] == 0 && s < 56) s += 8
		if (b[s] == opposite * Piece.queen || b[s] == opposite * Piece.rook) return true
	} else {
		// k p qr
		let s = sq - 8
		while (b[s] == 0 && s > 7) s -= 8
		if (b[s] == opposite * Piece.queen || b[s] == opposite * Piece.rook) return true
	}
	return false
}

/**
 * @param {number} sq
 * @param {number[]} b board
 * @returns {number}
 */
export function diagonal_pin(sq, b) {
	if (Math.abs(b[sq]) == Piece.king) return 0
	let color = b[sq] > 0 ? 1 : -1
	let opposite = -color
	// FIXME should not search king sq here
	// mb add func like is_between(sq, sq1, sq2, board) and use it for pin checks
	let king_sq = b.findIndex(sq => sq == Piece.king * color)
	if (king_sq == -1) return 0
	else if (!same_diagonal(sq, king_sq)) return 0
	let step = (sq - king_sq) % 9 == 0 ? 9 : (sq - king_sq) % 7 == 0 ? 7 : 0
	if (step == 0) return 0 // the piece and the king aren't on the same diagonal
	if (sq < king_sq) step = -step
	let s = sq + step
	while (b[s] == 0 && s < 56 && s > 7 && s % 8 != 0 && s % 8 != 7) s += step
	if (b[s] != opposite * Piece.queen && b[s] != opposite * Piece.bishop) return 0
	// check if there are no pieces between the given square and the king
	s = sq - step
	while (s != king_sq && s >= 0 && s < 64) {
		if (b[s] != 0) return 0
		s -= step
	}
	return Math.abs(step)
}

/**
 * @param {number} sq
 * @param {Scope} scope
 * @return {boolean}
 */
function in_scope(sq, scope) {
	if (scope.square) return scope.square == sq
	else if (scope.rank)
		return same_rank(sq, scope.rank.from) && sq >= scope.rank.from && sq <= scope.rank.to
	else if (scope.file)
		return same_file(sq, scope.file.from) && sq >= scope.file.from && sq <= scope.file.to
	else if (scope.diag) {
		return (
			same_diagonal(sq, scope.diag.from) &&
			same_diagonal(sq, scope.diag.to) &&
			sq >= scope.diag.from &&
			sq <= scope.diag.to
		)
	}
	return true
}

/**
 * @param {number} sq
 * @param {number[]} b board
 * @param {Scope} scope
 * @returns {Move[]}
 */
export function get_rook_moves(sq, b, scope = {}) {
	if (diagonal_pin(sq, b) != 0) return []
	let moves = []
	let color = b[sq] > 0 ? Color.white : Color.black
	let pinned_to_rank = rank_pin(sq, b)
	let pinned_to_file = file_pin(sq, b)
	// scope = square | rank | file | diag
	if (pinned_to_rank && scope.rank) return []
	if (pinned_to_file && scope.file) return []

	// FIXME: instead of using in_scope everywhere
	// add some scope checks like if (scope.square) {...} etc.

	let s
	if (!pinned_to_file) {
		// moving right in the rank
		for (s = sq + 1; s < 64 && b[s] == 0 && s % 8 != 0; s++)
			if (in_scope(s, scope)) moves.push({ from: sq, to: s })
		if (s < 64 && s % 8 != 0 && is_capture(b[s], color))
			if (in_scope(s, scope)) moves.push({ from: sq, to: s })

		// moving left in the rank
		for (s = sq - 1; s >= 0 && b[s] == 0 && s % 8 != 7; s--)
			if (in_scope(s, scope)) moves.push({ from: sq, to: s })
		if (s >= 0 && s % 8 != 7 && is_capture(b[s], color))
			if (in_scope(s, scope)) moves.push({ from: sq, to: s })
	}
	if (!pinned_to_rank) {
		// moving up in the file
		for (s = sq + 8; s < 64 && b[s] == 0; s += 8)
			if (in_scope(s, scope)) moves.push({ from: sq, to: s })
		if (s < 64 && is_capture(b[s], color)) if (in_scope(s, scope)) moves.push({ from: sq, to: s })

		// moving down in the file
		for (s = sq - 8; s >= 0 && b[s] == 0; s -= 8)
			if (in_scope(s, scope)) moves.push({ from: sq, to: s })
		if (s >= 0 && is_capture(b[s], color)) if (in_scope(s, scope)) moves.push({ from: sq, to: s })
	}
	return moves
}

/**
 * @param {number} sq - square where king is positioned
 * @param {number[]} board
 * @param {Scope} scope
 * @returns {Move[]} bishop moves from the given square for the given board
 */
export function get_bishop_moves(sq, board, scope = {}) {
	if (rank_pin(sq, board) || file_pin(sq, board)) return []
	/** @type {Move[]} */
	let moves = []
	let color = board[sq] > 0 ? 1 : -1

	let pinned_to_diag = diagonal_pin(sq, board)

	if (pinned_to_diag == 0 || pinned_to_diag == 9) {
		// moving up-right diagonally
		if (sq < 55 && sq % 8 != 7) {
			let s = sq + 9
			while (s < 64 && s % 8 != 0 && board[s] == 0) {
				if (in_scope(s, scope)) moves.push({ from: sq, to: s })
				s += 9
			}
			if (s < 64 && s % 8 != 0 && is_capture(board[s], color) && in_scope(s, scope))
				moves.push({ from: sq, to: s })
		}

		// moving down-left diagonally
		if (sq > 8 && sq % 8 != 0) {
			let s = sq - 9
			while (s >= 0 && (s + 9) % 8 != 0 && board[s] == 0) {
				if (in_scope(s, scope)) moves.push({ from: sq, to: s })
				s -= 9
			}
			if (s >= 0 && (s + 9) % 8 != 0 && is_capture(board[s], color) && in_scope(s, scope))
				moves.push({ from: sq, to: s })
		}
	}
	if (pinned_to_diag == 0 || pinned_to_diag == 7) {
		// moving up-left diagonally
		if (sq < 56 && sq % 8 != 0) {
			let s = sq + 7
			while (s < 63 && (s - 7) % 8 != 0 && board[s] == 0) {
				if (in_scope(s, scope)) moves.push({ from: sq, to: s })
				s += 7
			}
			if (s < 64 && (s - 7) % 8 != 0 && is_capture(board[s], color) && in_scope(s, scope))
				moves.push({ from: sq, to: s })
		}

		// moving down-right diagonally
		if (sq < 63 && sq % 8 != 7) {
			let s = sq - 7
			while (s % 8 != 0 && s > 0 && board[s] == 0) {
				if (in_scope(s, scope)) moves.push({ from: sq, to: s })
				s -= 7
			}
			if (s >= 0 && s % 8 != 0 && is_capture(board[s], color) && in_scope(s, scope))
				moves.push({ from: sq, to: s })
		}
	}
	return moves
}

/**
 * @param {number} sq - square where king is positioned
 * @param {number[]} board
 * @param {Scope} scope
 * @returns {Move[]} bishop moves from the given square for the given board
 */
export function get_queen_moves(sq, board, scope = {}) {
	// FIXME optimization: `rank_pin`, `file_pin` and `diagonal_pin` are evaluated again inside rook and bishop functions
	if (rank_pin(sq, board) || file_pin(sq, board)) return get_rook_moves(sq, board, scope)
	else if (diagonal_pin(sq, board) != 0) return get_bishop_moves(sq, board, scope)
	else return get_rook_moves(sq, board, scope).concat(get_bishop_moves(sq, board, scope))
}

/**
 * @param {number} sq
 * @param {number[]} b board
 * @param {Scope} scope
 * @returns {Move[]} knight moves from the given square for the given board
 */
export function get_knight_moves(sq, b, scope = {}) {
	// pinned knight has no moves
	if (rank_pin(sq, b) || file_pin(sq, b) || diagonal_pin(sq, b)) return []
	/** @type {Move[]} */
	let moves = []
	let color = b[sq] > 0 ? Color.white : Color.black

	let dest = sq + 10
	if (
		dest < 64 &&
		sq % 8 != 7 &&
		(sq + 2) % 8 != 0 &&
		empty_or_capture(b[dest], color) &&
		in_scope(dest, scope)
	)
		moves.push({ from: sq, to: dest })

	dest = sq + 6
	if (
		dest < 64 &&
		sq % 8 != 0 &&
		(sq - 1) % 8 != 0 &&
		empty_or_capture(b[dest], color) &&
		in_scope(dest, scope)
	)
		moves.push({ from: sq, to: dest })

	dest = sq - 6
	if (
		dest >= 0 &&
		sq % 8 != 7 &&
		sq % 8 != 7 &&
		empty_or_capture(b[dest], color) &&
		in_scope(dest, scope)
	)
		moves.push({ from: sq, to: dest })

	dest = sq - 10
	if (
		dest >= 0 &&
		sq % 8 != 0 &&
		(sq - 1) % 8 != 0 &&
		empty_or_capture(b[dest], color) &&
		in_scope(dest, scope)
	)
		moves.push({ from: sq, to: dest })

	dest = sq + 17
	if (dest < 64 && sq % 8 != 7 && empty_or_capture(b[dest], color) && in_scope(dest, scope))
		moves.push({ from: sq, to: dest })

	dest = sq + 15
	if (dest < 64 && sq % 8 != 0 && empty_or_capture(b[dest], color) && in_scope(dest, scope))
		moves.push({ from: sq, to: dest })

	dest = sq - 15
	if (dest >= 0 && sq % 8 != 7 && empty_or_capture(b[dest], color) && in_scope(dest, scope))
		moves.push({ from: sq, to: dest })

	dest = sq - 17
	if (dest >= 0 && sq % 8 != 0 && empty_or_capture(b[dest], color) && in_scope(dest, scope))
		moves.push({ from: sq, to: dest })

	return moves
}

/**
 * @param {number} sq - square where king is positioned
 * @param {number[]} b board
 * @param {Move | null} last_move
 * @param {Scope} scope
 * @param {number} king_sq king square
 * @returns {Move[]} pawn moves from the given square for the given board
 */
export function get_pawn_moves(sq, b, last_move = null, scope = {}, king_sq = -1) {
	if (rank_pin(sq, b)) return []
	/** @type {Move[]} */
	let moves = []
	let color = b[sq] > 0 ? Color.white : Color.black

	let pinned_to_file = file_pin(sq, b)
	let pinned_diag = diagonal_pin(sq, b)

	// one-square move
	let dest = sq + color * 8
	if (pinned_diag == 0 && b[dest] == 0 && in_scope(dest, scope)) moves.push({ from: sq, to: dest })
	// two-square move
	if (
		pinned_diag == 0 &&
		((color == Color.white && sq >= 8 && sq <= 15) ||
			(color == Color.black && sq >= 48 && sq <= 55)) &&
		b[sq + color * 8] == 0 &&
		b[sq + color * 16] == 0 &&
		in_scope(sq + color * 16, scope)
	)
		moves.push({ from: sq, to: sq + color * 16 })
	// captures
	if (!pinned_to_file) {
		if (pinned_diag != 9) {
			dest = sq + 7
			if (color == Color.white && sq % 8 != 0 && dest < 64 && b[dest] < 0 && in_scope(dest, scope))
				moves.push({ from: sq, to: dest })

			dest = sq - 7
			if (color == Color.black && sq % 8 != 7 && dest >= 0 && b[dest] > 0 && in_scope(dest, scope))
				moves.push({ from: sq, to: dest })
		}
		if (pinned_diag != 7) {
			dest = sq + 9
			if (color == Color.white && sq % 8 != 7 && dest < 64 && b[dest] < 0 && in_scope(dest, scope))
				moves.push({ from: sq, to: dest })

			dest = sq - 9
			if (color == Color.black && sq % 8 != 0 && dest >= 0 && b[dest] > 0 && in_scope(dest, scope))
				moves.push({ from: sq, to: dest })
		}

		// en passant
		if (
			last_move != null &&
			Math.abs(b[last_move.to]) == Piece.pawn &&
			Math.abs(last_move.from - last_move.to) == 16 &&
			Math.abs(last_move.to - sq) == 1 &&
			same_rank(last_move.to, sq)
		) {
			// en passant capture is not possible if two pawns
			// are on the same rank between a king and an opposite color rook or queen
			let en_passant_pawn_sq = last_move.to
			let opposite = -color
			if (king_sq == -1) king_sq = get_king_sq(b, color)
			if (same_rank(sq, king_sq)) {
				if (king_sq > sq) {
					let k = -1
					let s = en_passant_pawn_sq > sq ? sq + k : sq + 2 * k
					while (s % 8 != 7 && b[s] == 0) s += k
					if (s % 8 != 7 && (b[s] == opposite * Piece.queen || b[s] == opposite * Piece.rook))
						return moves
				} else {
					let k = 1
					let s = en_passant_pawn_sq > sq ? sq + 2 * k : sq + k
					while (s % 8 != 0 && b[s] == 0) s += k
					if (s % 8 != 0 && (b[s] == opposite * Piece.queen || b[s] == opposite * Piece.rook))
						return moves
				}
			}

			let dest = (last_move.from + last_move.to) / 2
			// if pinned to diagonal then only en passant capture on the pinned diagonal is possible
			if (pinned_diag == 0 || Math.abs(sq - dest) == pinned_diag)
				if (in_scope(dest, scope)) moves.push({ from: sq, to: dest })
		}
	}

	return moves
}

/**
 * @param {number} target
 * @param {number} color
 * @returns {boolean}
 */
function empty_or_capture(target, color) {
	return target == 0 || is_capture(target, color)
}

/**
 * @param {number} p1
 * @param {number} p2
 * @returns {boolean}
 */
function is_capture(p1, p2) {
	return (p1 < 0 && p2 > 0) || (p1 > 0 && p2 < 0)
}

/**
 * @param {number[]} board
 * @param {number} color
 * @returns {number} square
 */
function get_king_sq(board, color) {
	for (let sq = 0; sq < board.length; sq++) {
		if (board[sq] == color * Piece.king) return sq
	}
	return -1
}
