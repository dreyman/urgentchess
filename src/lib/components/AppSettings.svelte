<script>
import { appconfig, board_themes, piece_sets } from '$lib/app/appconfig.svelte.js'

let active_tab = $state('board')
let board_colors = appconfig.board.colors

/** @param {string} name */
async function use_piece_set(name) {
	// TODO mb should cache loaded svg content
	let resp = await fetch('/piece_sets/' + name)
	let svg = await resp.text()
	appconfig.board.piece_set_svg_content = svg
	appconfig.board.piece_set = name
}
</script>

<ul class="tabs flex items-center">
	<li class:active={active_tab == 'board'}>
		<button onclick={() => (active_tab = 'board')}>Board</button>
	</li>
	<li class:active={active_tab == 'game'}>
		<button onclick={() => (active_tab = 'game')}>Game</button>
	</li>
	<li class:active={active_tab == 'app'}>
		<button onclick={() => (active_tab = 'app')}>Application</button>
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
	<div class="flex flex-col gap-2">
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
	</div>
{/snippet}

{#snippet board_settings()}
	<div class="flex flex-col gap-2">
		<div class="flex items-center">
			<span class="mr-2">Colors:</span>
			{#each board_themes as theme}
				<button
					onclick={() => {board_colors.light = theme.light; board_colors.dark = theme.dark}}
					class="theme-btn flex items-center mx-1"
					class:active={theme.dark == board_colors.dark && theme.light == board_colors.light}
					aria-label={'Board theme: ' + theme.name}
				>
					<div class="h-6 w-6" style:background-color={theme.light}></div>
					<div class="h-6 w-6" style:background-color={theme.dark}></div>
				</button>
			{/each}
		</div>
		<div class="flex items-center">
			<span class="mr-2">Piece set:</span>
			{#each piece_sets as piece_set}
				<button onclick={() => use_piece_set(piece_set)}
					class="piece-set-btn py-1 px-2"
					class:active={appconfig.board.piece_set == piece_set}
				>
					{piece_set}
				</button>
			{/each}
		</div>
		<div class="flex items-center">
			<span class="mr-2">Board rendering:</span>
			<button onclick={() => appconfig.board.render = 'svg'}
				class="piece-set-btn py-1 px-2"
				class:active={appconfig.board.render == 'svg'}
			>
				svg
			</button>
			<button onclick={() => appconfig.board.render = 'canvas'}
				class="piece-set-btn py-1 px-2"
				class:active={appconfig.board.render == 'canvas'}
			>
				canvas (WIP)
			</button>
		</div>
		<label>
			<input type="checkbox" bind:checked={appconfig.board.sounds} />
			Board sounds
		</label>
		<label>
			<input type="checkbox" bind:checked={appconfig.board.highlight_last_move} />
			Highlight last move
		</label>
		<label>
			<input type="checkbox" bind:checked={appconfig.board.highlight_king_in_check} />
			Highlight king in check
		</label>
		<label>
			Piece size: <b>{100 + appconfig.board.piece_size * 2}%</b>
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

.tabs button {
	padding: 0.25rem 0.75rem;
}

.tabs > li.active {
	box-shadow: inset 0 -3px 0 0px #7babf8;
	color: #a8c7fa;
}

.theme-btn {
	background: #272727;
	padding: 0;
}

.theme-btn.active {
	border: 3px solid #a8c7fa;
}

.piece-set-btn {
	background: #3c3c3c;
	box-shadow: #272727 0px 0px 6px 2px inset;
}

.piece-set-btn.active {
	background: #4f4f4f;
	color: #a8c7fa;
	font-weight: bold;
	box-shadow: none;
}
</style>
