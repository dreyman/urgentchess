<script>
/*
TODO:
- add close optional button & on_close prop
- when window in resized: min/max height/width should also be changed
- title should be fixed - so only container body should ever be scrollable
 */
import { onMount } from 'svelte'
import { scale, fade } from 'svelte/transition'
let {
	title,
	minwidth = 200,
	minheight,
	width = 200,
	height = 200,
	top = '10%',
	left = '10%',
	resize = 'both',
	on_close,
	children
} = $props()
/** @type {HTMLElement} */
let el
/** @type {HTMLElement} */
let header
/** @type {HTMLElement} */
let content
let zindex = $state(10)

$effect(() => {
	if (left == 'center') {
		left = window.innerWidth / 2 - el.clientWidth / 2 + 'px'
	}
	if (top == 'center') {
		top = window.innerHeight / 2 - el.clientHeight / 2 + 'px'
	}
})

onMount(() => {
	if (minwidth) el.style.minWidth = minwidth + 'px'
	if (minheight) el.style.minHeight = minheight + 'px'
	else el.style.minHeight = 'fit-content'
})

/**
 * @param {HTMLElement} el
 */
function draggable(el) {
	if (!header) return
	header.onmousedown = start_drag

	el.style.maxWidth = window.innerWidth - el.offsetLeft - 5 + 'px'
	el.style.maxHeight = window.innerHeight - el.offsetTop - 5 + 'px'
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0

	function start_drag(e) {
		// if (!e.target.isEqualNode(header) && !e.target.isEqualNode(content.children[0]))
		// 	return
		zindex = 20
		e.preventDefault()
		el.style.width = el.clientWidth
		el.style.height = el.clientHeight
		// get the mouse cursor position at startup
		pos3 = e.clientX
		pos4 = e.clientY
		document.onmouseup = end_drag
		// call a function whenever the cursor moves
		document.onmousemove = drag
	}

	/**
	 * @param {MouseEvent} e
	 */
	function drag(e) {
		e.preventDefault()
		// if (el.offsetLeft > window.innerWidth - el.clientWidth) {
		// 	el.style.left = window.innerWidth - el.clientWidth - 5 + 'px'
		// 	return
		// }
		// if (el.offsetTop > window.innerHeight - el.clientHeight) {
		// 	el.style.top = window.innerHeight - el.clientHeight - 5 + 'px'
		// 	return
		// }
		// if (el.offsetLeft < 5) {
		// 	el.style.left = '5px'
		// 	return
		// }
		// if (el.offsetTop < 5) {
		// 	el.style.top = '5px'
		// 	return
		// }
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX
		pos2 = pos4 - e.clientY
		pos3 = e.clientX
		pos4 = e.clientY
		// el.style.left = el.offseLteft - pos1 + 'px'
		// el.style.top = el.offsetTop - pos2 + 'px'

		if (
			(el.offsetTop - pos2 < window.innerHeight - el.clientHeight || pos2 > 0) &&
			(el.offsetTop - pos2 > 0 || pos2 < 0)
		)
			el.style.top = el.offsetTop - pos2 + 'px'
		if (
			(el.offsetLeft < window.innerWidth - el.clientWidth || pos1 > 0) &&
			(el.offsetLeft > 0 || pos1 < 0)
		)
			el.style.left = el.offsetLeft - pos1 + 'px'
	}

	function end_drag() {
		zindex = 10
		el.style.width = el.clientWidth + 'px'
		if (height != 'auto') el.style.height = el.clientHeight + 'px'
		// el.style.width = 'auto'
		// el.style.height = 'auto'
		// el.style.maxWidth = window.innerWidth - el.offsetLeft - 5 + 'px'
		// el.style.maxHeight = window.innerHeight - el.offsetTop - 5 + 'px'
		document.onmouseup = null
		document.onmousemove = null
	}
}
</script>

<div
	bind:this={el}
	use:draggable
	class="draggable-box"
	style:width={width == 'auto' ? width : width + 'px'}
	style:height={height == 'auto' ? height : height + 'px'}
	style:z-index={zindex}
	style:resize
	style:top
	style:left
	in:scale={{ duration: 100, start: 0.75 }}
	out:fade={{ duration: 150 }}
>
	{#if title}
		<h3 bind:this={header} class="title">{title}</h3>
		<!-- TODO add on_close prop & close button here -->
	{/if}
	<div bind:this={content}>{@render children()}</div>
</div>

<style>
.draggable-box {
	position: absolute;
	background: #272727;
	overflow: auto;
	border-radius: 8px 8px 0 0;
	box-shadow: var(--draggable-box-shadow);
}

.title {
	background: #3c3c3c;
	color: #c6c6c6;
	text-align: center;
	cursor: move;
}
</style>
