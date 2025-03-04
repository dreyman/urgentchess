import type { Snippet } from 'svelte'

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

	type Move = {
		from: number
		to: number
		capture?: boolean,
		promotion_piece?: number
	}

	type Color = -1 | 1
	type Side = Color | 0
	type Piece = -6 | -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5 | 6

	type GameResult = {
		winner: Color | 0,
		details: string
		resign: Color,
		stalemate: boolean,
		checkmate: boolean,
	}

	type GameContext = {
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

	type ContainerProps = {
		title: string,
		minwidth?: number,
		minheight?: number,
		width?: number | string,
		height?: number | string,
		top?: string,
		left?: string,
		resize?: string,
		onclose?: function():void,
		children: Snippet
	}
}

export {};
