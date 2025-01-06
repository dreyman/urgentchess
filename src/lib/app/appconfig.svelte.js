const default_config = {
	board: {
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
	}
}

export const app_config = $state(structuredClone(default_config))

export const dev = $state({
	peer_id: null
})
