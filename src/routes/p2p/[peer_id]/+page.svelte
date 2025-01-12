<script>
import Peer from 'peerjs'
// import { Peer } from '$lib/app/fakepeer.js'
import { ulid } from 'ulid'
import { onMount, onDestroy } from 'svelte'
import { goto } from '$app/navigation'
import { storage } from '$lib/app/storage.js'
import Loading from '$lib/components/Loading.svelte'
import P2PChessGame from '$lib/components/P2PChessGame.svelte'
import Container from '$lib/components/Container.svelte'
import { Game, Clock } from '$lib/app/model.svelte.js'

let { data } = $props()

// let game = $state(data.container ? null : storage.get('game'))
// let side = $state(data.container ? null : storage.get('side'))
let game = $state.raw(storage.get('game'))
let side = $state(storage.get('side'))
let peer = storage.get('peer')
let con = storage.get('connection')
let loading_err = $state(false)
let status = $state('')
let game_count = $state(1)
/** @type {any[]} */
let p2p_messages = $state([])
let title = $derived('Game ' + game_count + (game.result_message ? ': ' + game.result_message : ''))

onDestroy(() => {
	peer.destroy()
})

onMount(() => {
	if (!peer) {
		status = 'creating peer'
		peer = new Peer(ulid())
		peer.on('open', () => {
			status = 'connecting'
			con = peer.connect(data.peer_id)
			setup_connection(con)
			con.on('open', () => (status = 'connected'))
		})
	} else {
		setup_connection(con)
		con.on('open', () => {
			status = 'connected'
			con.send({ game: get_game_data(game), side: -side })
		})
	}
	peer.on('connection', on_connection)
	peer.on('error', on_peer_error)
})

/** @param {import('peerjs').DataConnection} con */
function setup_connection(con) {
	con.on('data', /** @param {any} data */ data => {
		if (data.game) {
			game = get_game_from_data(data.game)
			side = data.side
		} else {
			p2p_messages.push(data)
		}
	})
	con.on('close', () => (status = 'connection closed'))
	con.on('error', () => (status = 'connection error'))
}

/** @param {any} data */
function send_data(data) {
	con.send(data)
}

/** @param {import('peerjs').PeerError<?>} err */
function on_peer_error(err) {
	console.log(err)
	status = 'Error: Connection failed'
	loading_err = true
}

/** @param {import('peerjs').DataConnection} connection */
function on_connection(connection) {
	status = 'new connection'
	con.close()
	con = connection
	setup_connection(con)
	con.on('open', () => {
		status = 'connected'
		con.send({ game: get_game_data(game), side: -side })
	})
	goto(`#/p2p/${connection.peer}`)
}

function onrematch() {
	let clock = new Clock(
		game.clock.initial_time,
		game.clock.initial_time,
		game.clock.initial_time,
		game.clock.increment
	)
	game = new Game(clock)
	side = -side
	game_count++
	p2p_messages = []
}

/** @param {Game} game */
function get_game_data(game) {
	return {
		board: game.board,
		initial_time: game.clock.initial_time,
		white_time: game.clock.time1.val,
		black_time: game.clock.time2.val,
		increment: game.clock.increment,
		moves: game.moves
	}
}

/** @param {any} game_data */
function get_game_from_data(game_data) {
	let white_clock_active = game_data.moves.length > 1 && game_data.moves.length % 2 == 0
	let black_clock_active = game_data.moves.length > 1 && game_data.moves.length % 2 == 1
	let clock = new Clock(
		game_data.initial_time,
		game_data.white_time,
		game_data.black_time,
		game_data.increment,
		white_clock_active,
		black_clock_active
	)
	return new Game(clock, game_data.board, game_data.moves)
}
</script>

<div class="flex w-full flex-col items-center justify-center gap-2">
	{#if !game && status != ''}
		<div class="flex h-screen w-full flex-col items-center justify-center gap-2">
			<Loading message={status} status={loading_err ? 'err' : undefined} />
		</div>
	{/if}
	{#if game}
		{#key game_count}
			<Container
				{title}
				resize="horizontal"
				minwidth={100}
				width={400}
				height="auto"
				left="center"
				top="center"
			>
				<P2PChessGame {game} {side} {onrematch} messages={p2p_messages} {send_data} />
			</Container>
		{/key}
	{/if}
</div>

<style>
</style>
