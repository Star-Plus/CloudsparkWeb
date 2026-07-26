<script lang="ts">
    import { goto } from "$app/navigation";
    import AuthService from "$lib/features/auth/AuthService";
	import appApi from "$lib/utils/apis/appApi";
    import { onMount } from "svelte";
    
    let { children } = $props();
    
    let isAuthenticated = $state(false);

    onMount(() => { 
        const authService = new AuthService(appApi);

        if (!authService.isAuthenticated()){
            goto("/login");
            return;
        }

        isAuthenticated = true;
    });

</script>

{#if isAuthenticated}
{@render children()}
{/if}