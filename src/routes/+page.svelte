<script>
import { goto } from '$app/navigation'
import CreateGameForm from '$lib/components/CreateGameForm.svelte'
import { storage } from '$lib/app/storage.js'
import { dev } from '$lib/app/appconfig.svelte.js'

function new_game(data) {
	storage.set('game', data.game)
	storage.set('side', data.side)
	storage.set('game_data', data.game_data)
	goto('#/p2p')
}
</script>

<div class="flex h-screen w-full flex-col items-center justify-center">
	<div class="w-full px-10 sm:w-80 sm:px-0">
		<h1 class="text-center">CREATE A GAME</h1>
		<CreateGameForm onsubmit={new_game} className="mt-6" />
	</div>
</div>

<style>
h1 {
	font-weight: bold;
	font-size: 1.5rem;
}
</style>
