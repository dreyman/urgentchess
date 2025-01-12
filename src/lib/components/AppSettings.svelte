<script>
import { appconfig, board_themes } from '$lib/app/appconfig.svelte.js'

let active_tab = $state('board')
let board_theme = $state(appconfig.board.theme.name)

$effect(() => {
	let selected_theme = board_themes.find(t => t.name == board_theme) ?? board_themes[0]
	appconfig.board.colors.light = selected_theme.light
	appconfig.board.colors.dark = selected_theme.dark
})

</script>

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

{#snippet app_settings()}
	<label>
		Clock update interval: <b>{appconfig.game.time_update_interval}ms</b>
		<input
			type="range"
			min="50"
			max="950"
			step="50"
			bind:value={appconfig.game.time_update_interval}
			class="w-full"
		/>
	</label>
{/snippet}

{#snippet board_settings()}
<div class="flex flex-col gap-2">
	<fieldset>
		<legend>Board theme:</legend>
		<div class="flex gap-6">
			{#each board_themes as theme}
				<label class="flex items-center gap-1">
					<input
						type="radio"
						name="Board theme"
						value={theme.name}
						bind:group={board_theme} />
					<span class:selected={board_theme == theme.name}>{theme.name}</span>
					<div class="ml-1 flex">
						<div class="w-4 h-4" style:background-color={theme.light}></div>
						<div class="w-4 h-4" style:background-color={theme.dark}></div>
					</div>
				</label>
			{/each}
		</div>
	</fieldset>
	<label>
		<input type="checkbox" bind:checked={appconfig.board.sounds} />
		Board sounds
	</label>
	<label>
		<input type="checkbox" bind:checked={appconfig.board.highlight_last_move} />
		Highlight last move
	</label>
	<label>
		Piece size: <b>{100 + appconfig.board.piece_size}%</b>
		<input
			type="range"
			min="-20"
			max="20"
			step="1"
			bind:value={appconfig.board.piece_size}
			class="w-full"
		/>
	</label>
</div>
{/snippet}

{#snippet game_settings()}
<div class="flex flex-col gap-1">
	<label>
		<input type="checkbox" bind:checked={appconfig.game.random_move} />
		[P2P] Make random move
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
	padding: 0.25rem 0.75rem;
}

.selected {
	color: #a8c7fa;
}

.tabs > li.active {
	box-shadow: inset 0 -3px 0 0px #7babf8;
	color: #a8c7fa;
}
</style>
