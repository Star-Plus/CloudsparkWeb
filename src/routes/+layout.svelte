<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		// Intercept Google implicit flow tokens sent to the hash
		const hash = window.location.hash;
		if (hash && hash.includes('id_token=')) {
			console.log('Intercepted Google Implicit OAuth Hash');
			const params = new URLSearchParams(hash.substring(1));
			const idToken = params.get('id_token');
			if (idToken) {
				// Don't save it directly here, pass it to the confirm route as requested
				window.location.hash = ''; // Clear the hash from the URL
				goto(`/auth/confirm?token=${idToken}`);
			}
		}
	});

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
