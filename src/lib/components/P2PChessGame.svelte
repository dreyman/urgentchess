<script>
import { onMount, untrack } from 'svelte'
import Game from '$lib/components/Game.svelte'
import { app_config } from '$lib/app/appconfig.svelte.js'

let { game, side, messages, onrematch, send_data } = $props()
let opposite_side = $derived(-side)
let pending_draw_offer = $state(false)
let offering_draw = $state(false)
let pending_rematch_offer = $state(false)
let offering_rematch = $state(false)

const p2p = {
	resign: 'resign',
	draw_offer: 'draw_offer',
	accept_draw: 'accept_draw',
	decline_draw: 'decline_draw',
	cancel_draw_offer: 'cancel_draw_offer',
	rematch_offer: 'rematch_offer',
	cancel_rematch_offer: 'cancel_rematch_offer',
	accept_rematch: 'accept_rematch',
	decline_rematch: 'decline_rematch'
}

$effect(() => {
	let last_msg = messages[messages.length - 1]
	if (last_msg) {
		untrack(() => on_data(last_msg))
	}
})

function onmove(move) {
	send_data({ move })
}

function on_data(data) {
	if (data.move && game.result === null) {
		game.move(data.move)
		if (app_config.game.random_move) {
			let random_move = game.get_random_legal_move()
			if (random_move) {
				send_data({ move: random_move })
				game.move(random_move)
			}
		}
	} else if (data.message) {
		switch (data.message) {
			case p2p.resign:
				game.resign(opposite_side)
				break
			case p2p.draw_offer:
				pending_draw_offer = true
				break
			case p2p.accept_draw:
				game.end_with_draw()
				break
			case p2p.decline_draw:
				offering_draw = false
				break
			case p2p.cancel_draw_offer:
				pending_draw_offer = false
				break
			case p2p.rematch_offer:
				pending_rematch_offer = true
				break
			case p2p.cancel_rematch_offer:
				pending_rematch_offer = false
				break
			case p2p.accept_rematch:
				offering_rematch = false
				onrematch()
				break
			case p2p.decline_rematch:
				offering_rematch = false
				break
			default:
				console.assert(false, 'Unhandled p2p message: ' + data.message)
		}
	}
}

function resign() {
	send_data({ message: p2p.resign })
	game.resign(side)
}

function offer_draw() {
	offering_draw = true
	send_data({ message: p2p.draw_offer })
}

function accept_draw() {
	send_data({ message: p2p.accept_draw })
	game.end_with_draw()
}

function decline_draw() {
	send_data({ message: p2p.decline_draw })
	pending_draw_offer = false
}

function cancel_draw_offer() {
	offering_draw = false
	send_data({ message: p2p.cancel_draw_offer })
}

function offer_rematch() {
	offering_rematch = true
	send_data({ message: p2p.rematch_offer })
}

function cancel_rematch_offer() {
	offering_rematch = false
	send_data({ message: p2p.cancel_rematch_offer })
}

function accept_rematch() {
	send_data({ message: p2p.accept_rematch })
	pending_rematch_offer = false
	onrematch()
}

function decline_rematch() {
	pending_rematch_offer = false
	send_data({ message: p2p.decline_rematch })
}
</script>

<div class="game-controls flex w-full">
	{#if game.result !== null}
		<span class="label w-1/2 uppercase">{game.result_message}</span>
		{#if offering_rematch}
			<button onclick={cancel_rematch_offer} class="red-btn w-1/2 py-1">Cancel rematch</button>
		{:else if pending_rematch_offer}
			<button onclick={accept_rematch} class="green-btn w-1/4 py-1">Accept</button>
			<button onclick={decline_rematch} class="red-btn w-1/4 py-1">Decline</button>
		{:else}
			<button onclick={offer_rematch} class="btn w-1/2 py-1">Rematch</button>
		{/if}
	{:else if pending_draw_offer}
		<span class="label w-1/2">Draw offer</span>
		<button onclick={accept_draw} class="green-btn w-1/4 py-1">Accept</button>
		<button onclick={decline_draw} class="red-btn w-1/4 py-1">Decline</button>
	{:else}
		<button onclick={resign} class="btn w-1/2 py-1">Resign</button>
		{#if offering_draw}
			<button onclick={cancel_draw_offer} class="red-btn w-1/2 py-1">Cancel draw offer</button>
		{:else}
			<button onclick={offer_draw} class="btn w-1/2 py-1">Offer draw</button>
		{/if}
	{/if}
</div>
<Game {game} {side} {onmove} />

<style>
.game-controls > button {
	font-size: 0.9rem;
}

.label {
	font-size: 1.25rem;
	text-align: center;
}

.btn:hover {
	background: #4f4f4f;
}

.green-btn {
	background: #579157;
}

.green-btn:hover {
	background: #378a37;
	color: #fff;
}

.red-btn {
	background: #a13333;
}

.red-btn:hover {
	background: #a32424;
	color: #fff;
}
</style>
