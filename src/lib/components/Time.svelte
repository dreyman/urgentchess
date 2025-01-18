<script>
import { appconfig } from '$lib/app/appconfig.svelte.js'

/** @type {{
 * time: import('$lib/app/model.svelte.js').Time
 * ontimeout: function():void
 * activebg: string
 * inactivebg: string
 }} */
let { time, ontimeout, activebg = '#394822', inactivebg = '#252320' } = $props()
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

<div
	class="time"
	class:active={time.active}
	style:background-color={time.active ? activebg : inactivebg}
	style:color={time.active ? inactivebg : activebg}
>
	{minutes}:{seconds}
</div>

<style>
.time {
	/*	color: #fff;*/
	font-size: 1.5rem;
	background: #252320;
	padding: 0rem 0.5rem;
	line-height: normal;
}

.active {
	font-weight: bold;
	/*	background: #394822;*/
}
</style>
