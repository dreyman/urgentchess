<script>
import { goto } from '$app/navigation'
import CreateGameForm from '$lib/components/CreateGameForm.svelte'
import { storage } from '$lib/app/storage.js'

/**
 * @param {import('$lib/app/model.svelte.js').Game} game
 * @param {Side} side
 */
function new_game(game, side) {
	storage.set('game', game)
	storage.set('side', side)
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
