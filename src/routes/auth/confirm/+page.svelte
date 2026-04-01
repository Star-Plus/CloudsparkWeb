<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    onMount(() => {
        const token = $page.url.searchParams.get("token");
        if (token) {
            console.log("Confirmed Auth with token:", token);
            localStorage.setItem("token", token);
            // Wait briefly so the user sees the page, then redirect to home
            setTimeout(() => goto("/"), 1000); 
        } else {
            // Handle error, token missing
            goto("/login");
        }
    });

</script>

<div class="h-screen w-full bg-background flex flex-col items-center justify-center text-txt-main">
    <div class="animate-pulse">
        <h2 class="text-2xl font-bold font-primary">Authenticating...</h2>
        <p class="text-txt-muted text-sm mt-2">Please wait while we log you in.</p>
    </div>
</div>
