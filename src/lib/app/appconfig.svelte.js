export const board_themes = [
	{
		name: 'Lichess',
		light: '#f0d9b5',
		dark: '#b58863',
	},
	{
		name: 'Chesscom',
		light: '#eeeed1',
		dark: '#759655',
	},
	{
		name: 'Rigor',
		light: '#a8c7fa',
		dark: '#8a8a8a'
	},
	{
		name: 'Fancy',
		light: '#ffc7c8',
		dark: '#E77FD6'
	}
]

export const piece_sets = ['default', 'anarcandy', 'horsey']

const default_theme = board_themes[1]
const default_piece_set = piece_sets[0]

const default_config = {
	board: {
		sounds: true,
		colors: {
			light: default_theme.light,
			dark: default_theme.dark,
			// selected_piece: '#a186f1',
			// FIXME selected piece/square color shouldn't be unique,
			// but should be set in a board_theme,
			// so that it will match with board square colors
			selected_piece: '#7babf8',
			last_move: '#ccd169',
			promotion_piece_bg: '#ccd169'
		},
		piece_set: default_piece_set,
		piece_set_svg_content: '',
		highlight_last_move: true,
		highlight_king_in_check: true,
		animations: false, // TODO impl for true
		piece_shadow_opacity: 0.4,
		piece_size: 0,
	},
	game: {
		random_move: false,
		// TODO impl dynamic interval: max interval when there's a lot of time
		// and min interval when less than ~20sec
		time_update_interval: 950,
	}
}

export const appconfig = $state(structuredClone(default_config))

/**
 * @param {string} square_color
 * @param {string} highlight_color
 * @returns {string}
 */
export function hightlighted_square_color(square_color, highlight_color) {
	return `color-mix(in srgb, ${square_color} 25%, ${highlight_color} 75%)`
}
