<script>
import { app_config } from '$lib/app/appconfig.svelte.js'

let active_tab = $state('board')
</script>

<div class="">
	<ul class="tabs flex items-center">
		<li class:active={active_tab == 'app'}>
			<button onclick={() => (active_tab = 'app')}>Application</button>
		</li>
		<li class:active={active_tab == 'board'}>
			<button onclick={() => (active_tab = 'board')}>Board</button>
		</li>
		<li class:active={active_tab == 'game'}>
			<button onclick={() => (active_tab = 'game')}>Game</button>
		</li>
	</ul>
	<section class="p-2">
		{#if active_tab == 'app'}
			{@render app_settings()}
		{:else if active_tab == 'board'}
			{@render board_settings()}
		{:else if active_tab == 'game'}
			{@render game_settings()}
		{/if}
	</section>
</div>

{#snippet app_settings()}
	nothing here yet
{/snippet}

{#snippet board_settings()}
	Piece size: {app_config.board.piece_size}
	<input
		type="range"
		min="-20"
		max="20"
		step="1"
		bind:value={app_config.board.piece_size}
		class="w-full"
	/>
{/snippet}

{#snippet game_settings()}
<div class="flex flex-col">
	<label>
		<input type="checkbox" bind:checked={app_config.game.board_sounds} />
		Board sounds
	</label>
	<label>
		<input type="checkbox" bind:checked={app_config.game.random_move} />
		Make random move
	</label>
</div>
{/snippet}

<style>
.tabs {
	background: #3c3c3c;
}

.tabs > li {
	font-size: 1rem;
}

.tabs > li:hover {
	background: #4f4f4f;
}

button {
	padding: 0.25rem 0.75rem 0.25rem 0.75rem;
}

.tabs > li.active {
	box-shadow: inset 0 -3px 0 0px #7babf8;
	color: #a8c7faff;
}
</style>
