// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Move {
		from: number
		to: number
		capture: boolean | undefined
	}

	type Color = -1 | 1;

	interface GameResult {
		winner: Color | 0,
		details: string
		resign: Color,
		stalemate: boolean,
		checkmate: boolean,
	}

	// interface Game {
	// 	side: -1 | 1
	// 	time: number,
	// 	increment: number,
	// 	board: number[],
	// 	state: GameState
	// }

	interface GameState {
		moves: Move[],
		woo: boolean,
		wooo: boolean,
		boo: boolean,
		booo: boolean,
		wking: number,
		bking: number,
		white_in_check: boolean,
		black_in_check: boolean,
	}
}

export {};
