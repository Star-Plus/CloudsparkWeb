<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    // Track state to show a humanized error message if needed
    let isAuthenticating = true;
    let errorMessage = "Please wait while we log you in.";

    onMount(async () => {
        const idToken = $page.url.searchParams.get("token");

        if (!idToken) {
            console.warn("No ID token found in URL, returning to login.");
            goto("/login");
            return;
        }

        console.log("Confirmed Google Auth Hash. Exchanging with backend...");
        
        try {
            // Target HTTP port 5000 directly for local Dev, or Prod server otherwise.
            const apiUrl = import.meta.env.DEV ? "http://localhost:5000/api" : "https://158.101.230.143/api";

            // Fire off the secure token exchange
            const response = await fetch(`${apiUrl}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken })
            });

            if (!response.ok) {
                // If it's a 500 error, it's likely the backend databases being down
                throw new Error(`The backend responded with an error (Status: ${response.status}). Ensure the database is running.`);
            }

            const loginRes = await response.json();
            console.log("Backend login successful. Hello,", loginRes.username);

            // Store securely in browser layout
            if (loginRes.token) localStorage.setItem("token", loginRes.token);
            if (loginRes.username) localStorage.setItem("user", JSON.stringify({ username: loginRes.username }));

            // Cleanly transition the user inwards
            setTimeout(() => {
                goto(loginRes.firstTime ? "/profile/create" : "/");
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
