<script lang="ts">
    import Icon from "@iconify/svelte";
    import type UserProfileResponse from "../dtos/UserProfileResponse";
    import { onMount } from "svelte";

    export let profile: UserProfileResponse;

    onMount(() => {
        console.log(profile);
    });
</script>

<header class="profile-header">
    <div class="avatar-container">
        {#if profile.avatarUrl}
            <img
                src={profile.avatarUrl}
                alt={profile.username}
                class="avatar-image"
            />
        {:else}
            <div class="avatar-placeholder">
                {profile.username.slice(0, 2).toUpperCase()}
            </div>
        {/if}
    </div>

    <div class="profile-info">
        <h1 class="profile-name">{profile.fullName}</h1>
        <div class="username-badge">
            <Icon icon="lucide:at-sign" class="at-icon" />
            <span>{profile.username}</span>
        </div>

        {#if profile.bio}
            <p class="bio">{profile.bio}</p>
        {/if}
    </div>
</header>

<style>
    .profile-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.75rem;
    }

    .avatar-container {
        position: relative;
    }

    .avatar-image {
        width: 6.5rem;
        height: 6.5rem;
        border-radius: 1.25rem;
        object-fit: cover;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #121212;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    }

    .avatar-placeholder {
        width: 6.5rem;
        height: 6.5rem;
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.03);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "Jost", sans-serif;
        font-size: 2rem;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 700;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
    }

    .profile-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
    }

    .profile-name {
        font-family: "Jost", sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-txt-main, #fff);
        margin: 0;
        letter-spacing: -0.01em;
        line-height: 1.2;
    }

    .username-badge {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.25rem 0.75rem;
        border-radius: 2rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
    }

    .bio {
        font-size: 0.875rem;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        line-height: 1.6;
        margin: 0.5rem 0 0 0;
        font-weight: 450;
    }
</style>
