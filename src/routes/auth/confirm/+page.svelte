<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
	import AuthService from "$lib/features/auth/AuthService";

    // Track state to show a humanized error message if needed
    let isAuthenticating = $state(true);
    let errorMessage = $state("Please wait while we log you in.");

    onMount(async () => {
        const hash = window.location.hash;

        let idToken: string | null = null;

		if (hash && hash.includes('id_token=')) {
			console.log('Intercepted Google Implicit OAuth Hash');
			const params = new URLSearchParams(hash.substring(1));
			idToken = params.get('id_token');
		} else {
            console.warn("No OAuth hash found in URL. Returning to login.");
            goto("/login");
            return;
        }

        if (!idToken) {
            console.warn("No ID token found in URL, returning to login.");
            goto("/login");
            return;
        }

        console.log("Confirmed Google Auth Hash. Exchanging with backend...");
        
        try {
            const authService = AuthService.getInstance();
            const resp = await authService.googleSignIn(idToken);

            const redirectUrl = sessionStorage.getItem("auth_redirect") || "/";
            sessionStorage.removeItem("auth_redirect");

            // Cleanly transition the user inward with a brief delay to show the success state
            setTimeout(() => {
                if (resp.firstTime) {
                    goto("/profile/create?redirect=" + encodeURIComponent(redirectUrl));
                }
                else {
                    window.location.href = redirectUrl;
                }
            }, 500);

        } catch (err) {
            console.error("Authentication Handshake Failed:", err);
            
            // Inform the user gracefully instead of freezing or bouncing silently
            isAuthenticating = false;
            errorMessage = "Failed to connect to the backend server. Please make sure the databases are running.";
            
            setTimeout(() => {
                goto("/login");
            }, 3000);
        }
    });
</script>

<div class="h-screen w-full bg-background flex flex-col items-center justify-center text-txt-main">
    <div class="text-center {isAuthenticating ? 'animate-pulse' : ''}">
        <h2 class="text-2xl font-bold font-primary">
            {isAuthenticating ? 'Authenticating...' : 'Connection Error'}
        </h2>
        <p class="text-txt-muted text-sm mt-2">{errorMessage}</p>
    </div>
</div>
