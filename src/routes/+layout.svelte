<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import HeaderBar from '../components/HeaderBar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<main class="bg-background-50 min-h-screen">

	<div class="sticky top-0 left-0 z-10 bg-background-50 border-b border-background-300 py-4 px-6">
		<HeaderBar />
	</div>

	<div class="w-full px-6 pt-6">
		{@render children()}
	</div>
</main>
