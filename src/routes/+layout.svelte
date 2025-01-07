<script>
import '../app.css'
import { dev } from '$lib/app/appconfig.svelte.js'
import Container from '$lib/components/Container.svelte'
import AppSettings from '$lib/components/AppSettings.svelte'
import P2PPage from './p2p/[peer_id]/+page.svelte'

let { children } = $props()
let settings_visible = $state(false)

function toggle_settings() {
	settings_visible = !settings_visible
}

function toggle_about() {}
</script>

<header class="py-2">
	<ul class="mx-auto flex h-full max-w-5xl items-center justify-center gap-8 px-8">
		<li><a href="/">Home</a></li>
		<li><button onclick={toggle_settings}>Settings</button></li>
		<li><button onclick={toggle_about}>About</button></li>
		<li><a href="#/random-game">Random game</a></li>
		<li><a href="#/playground">Playground</a></li>
	</ul>
</header>

{@render children()}

{#if settings_visible}
	<Container
		title="Settings"
		minwidth={260}
		minheight={300}
		width={400}
		height={450}
		top="5%"
		left="center"
	>
		<AppSettings />
	</Container>
{/if}

{#if dev.peer_id}
	<Container title="Fake Peer" resize="both" minwidth={100} width={300} height={400}>
		<P2PPage data={{ peer_id: dev.peer_id, container: true }} />
	</Container>
{/if}

<style>
header {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	background: #3c3c3c;
	box-shadow: var(--draggable-container-shadow);
}

header > * button:hover {
	color: #fff;
}
</style>
