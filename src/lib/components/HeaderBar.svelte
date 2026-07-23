<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import ThemeController from "$lib/controllers/theme/ThemeController.svelte";
	import { getAuthContext } from "$lib/features/auth/AuthContext.svelte";

    let themeController = $state<ThemeController | null>(null);

    const authService = getAuthContext().service;

    onMount(() => {
        themeController = ThemeController.getInstance();
    });

    function handleProfileClick() {
        const user = authService.getUser();
        if (!user) {
            console.warn("No user is currently logged in.");
            return;
        }

        goto(`/${user.username}`);
    }

</script>

<nav class="flex items-center justify-between">
    
    <div class="flex items-center gap-3">
        <a class="bg-background-950 rounded-circle p-1" href="/">
            <img src="/Icon.png" alt="Euler Logo" class="size-7 dark:invert" />
        </a>
        <p class="font-bold">Euler</p>
    </div>

    <div class="h-full flex items-center gap-1">

        <button class="side-button aspect-square" onclick={handleProfileClick}>
            <span class="material-symbols-rounded">
                account_circle
            </span>
        </button>

        <button class="side-button aspect-square" onclick={() => themeController?.toggleTheme()}>
            {#if themeController?.isDark} 
            <span class="material-symbols-rounded">
                light_mode
            </span>
            {:else} 
            <span class="material-symbols-rounded">
                dark_mode
            </span>
            {/if}
        </button>
    </div>

</nav>

<style>

    * {
        transition: background-color 0.3s, color 0.3s;
    }

    .side-button {
        border: 1px solid var(--color-background-300);
        padding: 0.5rem;
        border-radius: var(--radius-button);
        cursor: pointer;
        height: 2.5rem;
    }

    .side-button > span {
        font-size: 1.2rem;
        color: var(--color-text-800);
    }

</style>