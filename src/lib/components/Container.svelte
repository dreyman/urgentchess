<script>
/*
TODO:
- when window in resized: min/max height/width should also be changed
- title should be fixed - so only container body should ever be scrollable
 */
import { onMount } from 'svelte'
import { innerWidth, innerHeight } from 'svelte/reactivity/window'
import { scale, fade } from 'svelte/transition'
import Icon from '$lib/icons/Icon.svelte'
import Cross from '$lib/icons/cross.svg.svelte'

/** @type {ContainerProps} */
let {
	title,
	minwidth = 200,
	minheight,
	width = 200,
	height = 'auto',
	top = 'center',
	left = 'center',
	resize = 'none',
	onclose,
	children,
} = $props()
/** @type {HTMLElement} */
let el
/** @type {HTMLElement} */ // svelte-ignore non_reactive_update
let header
let dragging = $state(false)

$effect(() => {
	// FIXME when width/height isn't set in props then 'center' doesn't work propery
	if (left == 'center') el.style.left = innerWidth.current / 2 - el.clientWidth / 2 + 'px'
	else if (left) el.style.left = left
	if (top == 'center') el.style.top = innerHeight.current / 2 - el.clientHeight / 2 + 'px'
	else if (top) el.style.top = top
})

onMount(() => {
	// FIXME get rid of this
	if (minwidth) el.style.minWidth = minwidth + 'px'
	if (minheight) el.style.minHeight = minheight + 'px'
	else el.style.minHeight = 'fit-content'
})

/** @param {HTMLElement} el */
function draggable(el) {
	if (!header) return
	header.onmousedown = start_drag

	/** @type {number} */
	let prevX
	/** @type {number} */
	let prevY

	/** @param {MouseEvent} e */
	function start_drag(e) {
		e.preventDefault()

		prevX = e.clientX
		prevY = e.clientY

		document.onmouseup = end_drag
		document.onmousemove = drag
	}

	/** @param {MouseEvent} e */
	function drag(e) {
		dragging = true
		left = top = ''
		e.preventDefault()

		let posX = prevX - e.clientX
		let posY = prevY - e.clientY
		prevX = e.clientX
		prevY = e.clientY

		if (
			(el.offsetTop - posY < window.innerHeight - el.clientHeight || posY > 0) &&
			(el.offsetTop - posY > 0 || posY < 0)
		) {
			el.style.top = el.offsetTop - posY + 'px'
		}
		if (
			(el.offsetLeft < window.innerWidth - el.clientWidth || posX > 0) &&
			(el.offsetLeft > 0 || posX < 0)
		) {
			el.style.left = el.offsetLeft - posX + 'px'
		}
	}

	function end_drag() {
		dragging = false
		el.style.width = el.clientWidth + 'px'
		if (el.offsetLeft > window.innerWidth - el.clientWidth)
			el.style.left = window.innerWidth - el.clientWidth + 'px'
		if (el.offsetTop > window.innerHeight - el.clientHeight)
			el.style.top = window.innerHeight - el.clientHeight + 'px'
		if (height != 'auto') el.style.height = el.clientHeight + 'px'
		document.onmouseup = null
		document.onmousemove = null
	}
}
</script>

<div
	bind:this={el}
	use:draggable
	class="draggable-container"
	style:width={width == 'auto' ? width : width + 'px'}
	style:height={height == 'auto' ? height : height + 'px'}
	style:resize
	in:scale={{ duration: 100, start: 0.75 }}
	out:fade={{ duration: 150 }}
	class:opacity-95={dragging}
>
	{#if title}
		<h3 bind:this={header} class="title">
			<span>{title}</span>
			{#if onclose}
				<button onclick={onclose} class="close-btn h-5 w-5 rounded-full">
					<Icon Icon={Cross} />
				</button>
			{/if}
		</h3>
	{/if}
	<div>{@render children()}</div>
</div>

<style>
.draggable-container {
	position: absolute;
	background: #272727;
	overflow: auto;
	border-radius: 8px 8px 0 0;
	box-shadow: var(--draggable-container-shadow);
}

.title {
	background: #3c3c3c;
	color: #c6c6c6;
	text-align: center;
	cursor: move;
}

.close-btn {
	position: absolute;
	right: 0.35rem;
}
</style>
