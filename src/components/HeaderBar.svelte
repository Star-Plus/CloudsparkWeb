<script lang="ts">
	import { onMount } from "svelte";
    import Icon from "@iconify/svelte";

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

</script>

<nav class="bg-background-50 flex px-6 py-3 items-center justify-between">
    
    <div class="">
        <img src="/Icon.png" alt="CloudSpark Logo" class="size-9 invert dark:invert-0" />
    </div>


    <button class="bg-background-200 p-2 rounded-button text-text-600" onclick={toggleTheme}>
        {#if isDark} 
            <Icon icon="solar:moon-bold" /> 
        {:else} 
            <Icon icon="solar:sun-bold" /> 
        {/if}
    </button>
</nav>

<style>

    * {
        transition: background-color 0.3s, color 0.3s;
    }

</style>