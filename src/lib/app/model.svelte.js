import * as util from '$lib/chess/util.js'
import * as chess from '$lib/chess/chess.js'
/** @import {GameContext} from '$lib/chess/chess.js' */

export class Game {
	/** @type {number[]} */
	board = $state([])
	clock
	/** @type {GameContext} */
	context = $state(chess.create_context(this.board, []))
	/** @type {Move[]} */
	valid_moves = []

	white_resigned = $state(false)
	black_resigned = $state(false)
	white_timeout = $state(false)
	black_timeout = $state(false)
	checkmate_white = $state(false)
	checkmate_black = $state(false)
	stalemate = $state(false)
	draw = $state(false)
	// prettier-ignore
	result = $derived(
		this.white_resigned || this.white_timeout || this.checkmate_white ? -1
		: this.black_resigned || this.black_timeout || this.checkmate_black ? 1
		: this.stalemate || this.draw ? 0
		: null
	)
	// prettier-ignore
	result_message = $derived(
		this.white_timeout ? 'White time out. 0-1'
		: this.black_timeout ? 'Black time out. 1-0'
		: this.checkmate_white ? 'Checkmate. 0-1'
		: this.checkmate_black ? 'Checkmate. 1-0'
		: this.stalemate ? 'Stalemate. ½-½'
		: this.white_resigned ? 'White resigned. 0-1'
		: this.black_resigned ? 'Black resigned. 1-0'
		: this.draw ? 'Draw. ½-½'
		: ''
	)

	/**
	 * @param {Clock | null} clock
	 * @param {number[]} board
	 * @param {Move[]} moves
	 */
	constructor(clock, board = util.initial_position(), moves = []) {
		this.clock = clock
		this.board = board
		this.context = chess.create_context(this.board, moves)
		this.valid_moves = chess.get_moves(this.board, this.context)
	}

	/**
	 * @param {Move} move
	 * @returns {boolean}
	 */
	try_move(move) {
		if (this.is_legal_move(move)) {
			this.apply_legal_move(move)
			return true
		}
		return false
	}

	/** @param {Move} move */
	apply_legal_move(move) {
		util.apply_move(move, this.board, this.context)

		if (this.clock) {
			if (this.moves.length == 2) this.clock.start()
			else if (this.moves.length > 2) this.clock.toggle()
		}

		this.valid_moves = chess.get_moves(this.board, this.context)

		if (this.valid_moves.length == 0) {
			if (this.clock) this.clock.stop()
			if (this.context.white_in_check) this.checkmate_white = true
			else if (this.context.black_in_check) this.checkmate_black = true
			else this.stalemate = true
		}

		// automatic draw if only two kings are left on the board
		let non_king_piece = this.board.findIndex(
			p => p != 0 && p != chess.Piece.black_king && p != chess.Piece.white_king
		)
		if (non_king_piece == -1) {
			this.end_with_draw()
		}
	}

	/**
	 * @param {Move} move
	 * @returns {boolean}
	 */
	is_legal_move(move) {
		return this.valid_moves.findIndex(m => m.from == move.from && m.to == move.to) != -1
	}

	/** @returns {Move | null} */
	get_random_legal_move() {
		let len = this.valid_moves.length
		return len > 0 ? this.valid_moves[Math.floor(Math.random() * len)] : null
	}

	/** @param {number} side */
	resign(side) {
		if (side == 1) this.resign_white()
		else if (side == -1) this.resign_black()
	}

	end_with_draw() {
		if (this.clock) this.clock.stop()
		this.draw = true
	}

	resign_white() {
		if (this.clock) this.clock.stop()
		this.white_resigned = true
	}

	resign_black() {
		if (this.clock) this.clock.stop()
		this.black_resigned = true
	}

	get time1() {
		return this.clock.time1
	}

	get time2() {
		return this.clock.time2
	}

	get moves() {
		return this.context.moves
	}

	get last_move() {
		return this.moves.length > 0 ? this.moves[this.moves.length - 1] : null
	}
}

export class Clock {
	initial_time
	time1
	time2
	increment

	/**
	 * @param {number} initial_time
	 * @param {number} time1
	 * @param {number} time2
	 * @param {number} increment
	 */
	constructor(initial_time, time1, time2, increment, active1 = false, active2 = false) {
		this.initial_time = initial_time
		this.time1 = new Time(time1, increment, active1)
		this.time2 = new Time(time2, increment, active2)
		this.increment = increment
	}

	start() {
		this.time1.toggle()
	}

	stop() {
		this.time1.stop()
		this.time2.stop()
	}

	toggle() {
		this.time1.toggle()
		this.time2.toggle()
	}
}

export class Time {
	#t
	increment
	#running_since = -1
	active = $state(false)

	/**
	 * @param {number} val time in milliseconds
	 * @param {number} increment in milliseconds
	 */
	constructor(val, increment, active = false) {
		// FIXME if active is true, then also need to set running_since here
		this.#t = val
		this.increment = increment
		this.active = active
	}

	/**
	 * @returns {number}
	 */
	get val() {
		if (!this.active) return this.#t
		return this.#t - performance.now() + this.#running_since
	}

	set val(v) {
		this.#t = v
	}

	toggle() {
		this.#t = this.val
		this.active = !this.active
		if (this.active) {
			this.#running_since = performance.now()
		} else {
			this.#t += this.increment
		}
	}

	stop() {
		this.#t = this.val
		this.active = false
	}
}
