<script>
import Peer from 'peerjs'
import { ulid } from 'ulid'
import { onMount } from 'svelte'
import Loading from '$lib/components/Loading.svelte'
import { goto } from '$app/navigation'
import { storage } from '$lib/app/storage.js'

let game = storage.get('game') ?? goto('/')
let side = storage.get('side') ?? goto('/')
let invite_link = $state('')
/** @type {import('peerjs').Peer} */
let peer
let copied = $state(false)
let loading_message = $state('')

onMount(() => {
	loading_message = 'Connecting'
	peer = new Peer(ulid())
	peer.on('open', function (peer_id) {
		loading_message = 'Waiting for the opponent...'
		invite_link = location.href + '/' + peer_id
	})
	peer.on('connection', function (con) {
		storage.set('peer', peer)
		storage.set('connection', con)
		goto(`#/p2p/${con.peer}`)
	})
})

async function copy_link() {
	await navigator.clipboard.writeText(invite_link)
	copied = true
}
</script>

<div class="flex h-screen w-full flex-col items-center justify-center gap-2">
	<Loading message={loading_message} />
	{#if invite_link != ''}
		<div class="mt-6">
			<h1 class="text-center text-xl">Send this link to someone you'd like to play with:</h1>
			<h2 class="mt-3 text-sm">
				{invite_link}
				<button onclick={copy_link} class="copy-btn ml-1 rounded px-2 font-bold">
					{copied ? 'COPIED' : 'COPY'}
				</button>
			</h2>
			<!-- <button onclick={() => dev.peer_id = peer.id}
				class="copy-btn ml-1 rounded px-2 font-bold" >
				create fake peer
			</button> -->
		</div>
	{/if}
</div>

<style>
.copy-btn {
	background: #c6c6c6;
	color: #272727;
}
</style>
