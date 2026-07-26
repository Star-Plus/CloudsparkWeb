<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
    let {children} : {children: () => any} = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}