<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import HeaderBar from '../lib/components/HeaderBar.svelte';
	import { page } from '$app/stores';
	import navbarExeluded from '../global/NonNavbarPages';
	import { onMount } from 'svelte';
	import ThemeContext from '$lib/controllers/theme/ThemeContext.svelte';
	import { initializeTelemetry } from '$lib/utils/observe/telemetry';

	let { children } = $props();

	let renderNavbar = $state(false);

	onMount(() => {
		initializeTelemetry();

		page.subscribe(page => {
			const pagePath = page.url.pathname;
			renderNavbar = !navbarExeluded.includes(pagePath);
		})
	})

</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ThemeContext />

<main class="min-h-screen bg-background-100">

	{#if renderNavbar}
		<div class="sticky top-0 left-0 z-10 bg-background-50 border-b border-background-300 py-4 px-6">
			<HeaderBar />
		</div>
		<div class="w-full px-6 pt-6">
			{@render children()}
		</div>
	{:else}
		{@render children()}
	{/if}

</main>
