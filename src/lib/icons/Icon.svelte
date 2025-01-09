<script>
let { size = 'md', color = '#c6c6c6', hover_color = '#c6c6c6', Icon } = $props()
/** @type {HTMLElement} */
let wrapper
/** @type {any} */
let svg

$effect(() => {
	svg = wrapper.children[0]
	svg.setAttribute('fill', color)
})

function onmouseenter() {
	svg.setAttribute('fill', hover_color)
	wrapper.style.backgroundColor = 'color-mix(in srgb, #fff 20%, transparent)'
}

function onmouseleave() {
	svg.setAttribute('fill', color)
	wrapper.style.backgroundColor = 'inherit'
}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<i class={'size-' + size} bind:this={wrapper} {onmouseenter} {onmouseleave}>
	<Icon />
</i>

<style>
i {
	display: block;
	border: 1px solid #3d3d3d;
	border-radius: 100%;
}

.size-xs {
	width: 1rem;
	height: 1rem;
}

.size-sm {
	width: 1.25rem;
	height: 1.25rem;
}

.size-md {
	width: 1.5rem;
	height: 1.5rem;
}

.size-lg {
	width: 1.75rem;
	height: 1.75rem;
}

.size-xl {
	width: 2rem;
	height: 2rem;
}
</style>
