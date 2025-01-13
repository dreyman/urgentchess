export const board_themes = [
	{
		name: 'Default',
		light: '#f0d9b5',
		dark: '#b58863',
	},
	{
		name: 'Rigor',
		light: '#a8c7fa',
		dark: '#8a8a8a'
	},
	{
		name: 'Fancy',
		light: '#E77FD6',
		dark: '#ffb9ba'
	}
]

export const piece_sets = ['default', 'horsey', 'anarcandy']

const default_theme = board_themes[0]
const default_piece_set = piece_sets[0]

const default_config = {
	board: {
		sounds: true,
		colors: {
			light: default_theme.light,
			dark: default_theme.dark,
			selected_piece: '#a186f1',
			last_move: '#ccd169',
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
		time_update_interval: 250,
	}
}

export const appconfig = $state(structuredClone(default_config))
