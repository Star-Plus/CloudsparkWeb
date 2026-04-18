<script lang="ts">
    import { onMount } from "svelte";
    import TypingEffect from "$lib/components/TypingEffect.svelte";
    import FlowField from "$lib/components/vfx/FlowField.svelte";
    import { page } from "$app/state"

    async function handleGoogleSignIn() {
        const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";

        // Using Implicit Flow (token/id_token direct response) instead of Authorization Code.
        // We also use the base URL for redirect_uri to avoid mismatch errors if /login isn't whitelisted in GCP.

        const redirectParam = page.url.searchParams.get('redirectUri');

        const redirectUri = redirectParam ? redirectParam : window.location.origin;

        const params = new URLSearchParams({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: "token id_token",
            scope: "openid email profile",
            nonce: "nonce_" + Math.random().toString(36).substring(2)
        });

        window.location.href = `${googleAuthUrl}?${params.toString()}`;
    }

    onMount(() => {
        console.log("Web Auth Page Mounted");
    });
</script>

<div class="login-wrapper font-primary overflow-hidden">
    <div class="animated-bg"></div>
    <div class="ambient-glow"></div>
    <FlowField />

    <div
        class="relative w-full h-full flex flex-col justify-center items-center p-12 text-txt-main z-10"
    >

        <!-- Logo and Brand Name -->
        <div class="flex flex-col items-center space-y-6 mb-16 group">
            <div class="relative">
                <img
                    src="/Icon.png"
                    alt="CloudSpark logo"
                    class="relative size-24 object-contain select-none transition-transform duration-700 group-hover:scale-110"
                />
            </div>
            <h1 class="font-['Jost'] font-bold text-4xl select-none tracking-tight bg-clip-text text-transparent bg-linear-to-b from-white to-white/60">
                CloudSpark
            </h1>
        </div>

        <!-- Welcome Message with Typing Effect -->
        <div class="mb-12 max-w-sm text-center">
            <div class="text-txt-muted text-lg font-light tracking-wide">
                <TypingEffect />
            </div>
        </div>

        <!-- Buttons interactivity -->
        <div class="flex flex-col items-center space-y-4 max-w-xs w-full">
            <!-- svelte-ignore event_directive_deprecated -->
            <button
                type="button"
                on:click={handleGoogleSignIn}
                class="auth-button google-auth w-full flex justify-center"
            >
                <iconify-icon icon="flat-color-icons:google" width="22" height="22"></iconify-icon>
                <span>Sign in with Google</span>
            </button>
        </div>

        <footer class="absolute bottom-12 w-full text-center text-white/20 text-xs tracking-widest uppercase select-none">
            Add your touch.
        </footer>
    </div>
</div>

<style>
    .login-wrapper {
        position: relative;
        width: 100vw;
        height: 100vh;
        background-color: #121212;
    }

    .animated-bg {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 50%, #1c1c1c 0%, #121212 70%);
        opacity: 0.5;
        animation: pulse 10s ease-in-out infinite;
    }

    .ambient-glow {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 100%;
        background: radial-gradient(ellipse at top, rgba(255, 255, 255, 0.03) 0%, transparent 60%);
        pointer-events: none;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }

    .auth-button {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.875rem 1.5rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 1rem;
        color: white;
        font-weight: 500;
        font-size: 0.9375rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        backdrop-filter: blur(8px);
    }

    .auth-button:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.5);
    }

    .auth-button:active {
        transform: translateY(0) scale(0.98);
    }

    .google-auth:hover {
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
    }

    * {
        z-index: 1;
    }
</style>
