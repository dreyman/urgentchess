import * as util from '$lib/chess/util.js'
import * as chess from '$lib/chess/chess.js'

export class Game {
	/** @type {number[]} */
	board = $state([])
	clock

	/** @type {GameState} */
	state = $state(chess.create_state(this.board, []))

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
		this.white_timeout ? 'white time out'
		: this.black_timeout ? 'black time out'
		: this.checkmate_white ? 'Checkmate. Black won'
		: this.checkmate_black ? 'Checkmate. White won'
		: this.stalemate ? 'Stalemate'
		: this.white_resigned ? 'White resigned'
		: this.black_resigned ? 'Black resigned'
		: this.draw ? 'Draw'
		: ''
	)

	/**
	 * @param {Clock} clock
	 * @param {number[]} board
	 * @param {Move[]} moves
	 */
	constructor(clock, board = util.starting_position(), moves = []) {
		this.clock = clock
		this.board = board
		this.state = chess.create_state(this.board, moves)
		this.valid_moves = chess.get_moves(this.board, this.state)
	}

	/**
	 * @param {Move} move
	 */
	move(move) {
		if (this.clock.time1.val <= 0 || this.clock.time2.val <= 0 || !this.is_legal_move(move)) {
			return false
		}
		util.make_move(move, this.board, this.state)
		if (this.moves.length == 2) this.clock.start()
		else if (this.moves.length > 2) this.clock.toggle()
		this.valid_moves = chess.get_moves(this.board, this.state)
		if (this.valid_moves.length == 0) {
			this.clock.stop()
			if (this.state.white_in_check) this.checkmate_white = true
			else if (this.state.black_in_check) this.checkmate_black = true
			else this.stalemate = true
		}
		return true
	}

	/**
	 * @param {Move} move
	 * @returns {boolean}
	 */
	is_legal_move(move) {
		return this.valid_moves.findIndex(m => m.from == move.from && m.to == move.to) != -1
	}

	/**
	 * @returns {Move | null}
	 */
	get_random_legal_move() {
		let len = this.valid_moves.length
		return len > 0 ? this.valid_moves[Math.floor(Math.random() * len)] : null
	}

	/**
	 * @param {number} side
	 */
	resign(side) {
		if (side == 1) this.resign_white()
		else if (side == -1) this.resign_black()
	}

	end_with_draw() {
		this.clock.stop()
		this.draw = true
	}

	resign_white() {
		this.clock.stop()
		this.white_resigned = true
	}

	resign_black() {
		this.clock.stop()
		this.black_resigned = true
	}

	get time1() {
		return this.clock.time1
	}

	get time2() {
		return this.clock.time2
	}

	get moves() {
		return this.state.moves
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
