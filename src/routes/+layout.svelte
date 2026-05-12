<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import HeaderBar from '../components/HeaderBar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<main class="">

	<HeaderBar />

	<div>
		{@render children()}
	</div>
</main>
