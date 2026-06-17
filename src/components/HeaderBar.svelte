<script lang="ts">
	import { onMount } from "svelte";
    import Icon from "@iconify/svelte";
	import AuthService from "$lib/features/auth/AuthService";
	import { goto } from "$app/navigation";
	import ThemeController from "$lib/controllers/theme/ThemeController";

    let isDark = $state(false);
    let themeController = $state(ThemeController.getInstance());

    onMount(() => {
        themeController = ThemeController.getInstance();
    });

    function handleProfileClick() {
        const user = AuthService.getInstance().getUser();
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
            <img src="/Icon.png" alt="CloudSpark Logo" class="size-7 dark:invert" />
        </a>
        <p class="font-bold">CloudSpark</p>
    </div>

    <div>

        <button class="side-button" onclick={handleProfileClick}>
            <Icon icon="solar:user-linear" />
        </button>

        <button class="side-button" onclick={themeController.toggleTheme}>
            {#if isDark} 
            <Icon icon="solar:sun-linear" /> 
            {:else} 
            <Icon icon="solar:moon-linear" /> 
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
        color: var(--color-text-800);
        padding: 0.5rem;
        border-radius: var(--radius-button);
    }

</style>