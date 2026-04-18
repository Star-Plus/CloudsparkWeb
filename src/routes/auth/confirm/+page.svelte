<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import AuthService from "$lib/features/auth/AuthService";

    onMount(async () => {
        const idToken = $page.url.searchParams.get("token");
        if (idToken) {
            console.log("Confirmed Google Auth Hash. Exchanging with backend...");
            try {
                const loginRes = await AuthService.getInstance().googleLogin({ idToken });
                console.log("Backend login successful:", loginRes);

                // Wait briefly so the user sees the page, then redirect to home
                setTimeout(() => {
                    if (loginRes.firstTime) {
                        goto("/profile/create");
                    } else {
                         goto("/");
                    }
                }, 1000);
            } catch (err) {
                console.error("Backend auth failed", err);
                goto("/login");
            }
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
