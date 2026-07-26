<script>
	import { goto } from "$app/navigation";
	import ProtectedRoute from "$lib/features/auth/ProtectedRoute.svelte";
	import { onMount } from "svelte";

    onMount(() => {
        goto("/drive/");
    })

</script>

<ProtectedRoute>
    <h1>Welcome to SvelteKit</h1>
    <p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
</ProtectedRoute>
