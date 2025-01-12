export const board_themes = [
	{
		name: 'Default',
		light: '#f0d9b5',
		dark: '#b58863',
	},
	{
		name: 'Rigor',
		light: '#a8c7fa',
		dark: '#828282'
	},
	{
		name: 'Fancy',
		light: '#E77FD6',
		dark: '#ffb9ba'
	}
]

const default_config = {
	board: {
		theme: board_themes[1],
		sounds: true,
		colors: {
			light: '#f0d9b5',
			dark: '#b58863',
			selected_piece: '#a186f1',
			last_move: '#ccd169',
		},
		highlight_last_move: true,
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
