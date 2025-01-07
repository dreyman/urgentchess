<script>
import * as util from '$lib/chess/util.js'
import { app_config } from '$lib/app/appconfig.svelte.js'
import { Game as ChessGame, Clock } from '$lib/app/model.svelte.js'
// import { Connection } from '$lib/app/temp/fakepeer.js'
import Game from '$lib/components/Game.svelte'
import P2PChessGame from '$lib/components/P2PChessGame.svelte'
import CreateGameForm from '$lib/components/CreateGameForm.svelte'
import AppSettings from '$lib/components/AppSettings.svelte'
import Container from '$lib/components/Container.svelte'

let time = 12 * 60_000
let game = new ChessGame(new Clock(time, time, time, 2_000))
// let side = Math.random() > 0.5 ? 1 : -1
let side = 0
</script>

<Container
	title="Game"
	resize="horizontal"
	minwidth={100}
	width={500}
	height="auto"
	left="center"
	top="center"
>
	<!-- <Game {game} {side} /> -->
	<Game {game} {side} />
</Container>

<style>
.game-wrapper {
	resize: horizontal;
	overflow: auto;
}

.game-controls > button {
	width: 100%;
	font-size: 1.25rem;
	padding: 0.5rem 0.5rem;
	border-bottom: 1px solid #5d5d5d;
}

.game-controls > button:hover {
	background: #4f4f4f;
}
</style>
