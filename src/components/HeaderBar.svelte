<script lang="ts">
	import { onMount } from "svelte";
    import Icon from "@iconify/svelte";
	import AuthService from "$lib/features/auth/AuthService";
	import { goto } from "$app/navigation";

    let isDark = $state(false);

    onMount(() => {
        isDark = localStorage.getItem('theme') === 'dark';
        applyTheme(isDark);
    });

    function toggleTheme() {
        isDark = !isDark;
        applyTheme(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    function applyTheme(dark: boolean) {
        document.documentElement.classList.toggle('dark', dark);
    }

    function handleProfileClick() {
        const user = AuthService.getInstance().getUser();
        if (!user) {
            console.warn("No user is currently logged in.");
            return;
        }

        goto(`/${user.username}`);
    }

</script>

<nav class="bg-background-50 flex px-6 py-3 items-center justify-between">
    
    <a class="bg-background-950 rounded-circle p-1" href="/">
        <img src="/Icon.png" alt="CloudSpark Logo" class="size-7 dark:invert" />
    </a>

    <div>

        <button class="side-button" onclick={handleProfileClick}>
            <Icon icon="solar:user-bold" class="text-text-600" />
        </button>

        <button class="side-button" onclick={toggleTheme}>
            {#if isDark} 
            <Icon icon="solar:sun-bold" /> 
            {:else} 
            <Icon icon="solar:moon-bold" /> 
            {/if}
        </button>

    </div>


</nav>

<style>

    * {
        transition: background-color 0.3s, color 0.3s;
    }

    .side-button {
        background-color: var(--background-200);
        color: var(--text-600);
        padding: 0.5rem;
        border-radius: var(--radius-button);
    }

</style>