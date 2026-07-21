<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import HeaderBar from '../lib/components/HeaderBar.svelte';
	import { page } from '$app/stores';
	import navbarExeluded from '../global/NonNavbarPages';
	import { onMount } from 'svelte';
	import ThemeContext from '$lib/controllers/theme/ThemeContext.svelte';
	import { initializeTelemetry } from '$lib/utils/observe/telemetry';
	import ErrorWindow from '$lib/features/errors/ErrorWindow.svelte';

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

<main class="h-screen bg-background-50 flex flex-col overflow-auto">

	{#if renderNavbar}
		<div class="sticky top-0 left-0 z-10 bg-background-50 border-b border-background-300 py-4 px-6">
			<HeaderBar />
		</div>
		<div class="w-full flex-1 min-h-0">
			{@render children()}
		</div>
	{:else}
		{@render children()}
	{/if}

	<ErrorWindow />

</main>
