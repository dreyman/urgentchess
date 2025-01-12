<script>
import { appconfig } from '$lib/app/appconfig.svelte.js'

/** @type {{ time: import('$lib/app/model.svelte.js').Time, ontimeout: function():void }} */
let { time, ontimeout } = $props()
let t = $state(time.val)
let seconds = $derived.by(() => {
	let seconds = Math.floor((t / 1_000) % 60)
	return seconds < 10 ? '0' + seconds : seconds
})
let minutes = $derived.by(() => {
	let minutes = Math.floor(t / 60_000)
	return minutes < 10 ? '0' + minutes : minutes
})

$effect(() => {
	if (time.active) {
		let interval = setInterval(() => {
			t = time.val
			if (t <= 0) {
				t = 0
				ontimeout()
			}
		}, appconfig.game.time_update_interval)
		return () => {
			t = time.val
			clearInterval(interval)
		}
	}
})
</script>

<div class="time px-2" class:active={time.active}>
	{minutes}:{seconds}
</div>

<style>
.time {
	color: #fff;
	font-size: 1.5rem;
	background: #252320;
}

.active {
	background: #394822;
}
</style>
