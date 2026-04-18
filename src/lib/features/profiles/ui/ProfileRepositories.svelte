<script lang="ts">
    import CloneService from "$lib/features/remote/clone/CloneService";
    import { open } from "@tauri-apps/plugin-dialog";
    import type ProfileRepositoryResponse from "../dtos/ProfileRepositoryResponse";
    import { onMount } from "svelte";
    import UserProfileService from "../UserProfileService";

    export let username: string;
    let repositories: ProfileRepositoryResponse[] = [];
    let loading = true;

    async function cloneRepository(remoteId: string, repoName: string) {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: `Select Directory to Clone ${repoName} Into`,
            });

            if (!selected) {
                console.log("No directory selected for cloning.");
                return;
            }

            const cloneService = new CloneService();
            await cloneService.cloneRepository(
                selected,
                remoteId,
                repoName,
                null,
            );
        } catch (error) {
            console.error("Failed to clone repository:", error);
        }
    }

    onMount(async () => {
        try {
            repositories =
                await UserProfileService.getInstance().getUserRepositories(
                    username,
                );
            console.log(repositories);
        } finally {
            loading = false;
        }
    });
</script>

<section class="repos-section">
    <div class="section-header">
        <div class="header-left">
            <svg
                class="section-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
            </svg>
            <h2 class="section-title">Repositories</h2>
            <span class="repo-count">{repositories.length}</span>
        </div>
    </div>

    <div class="repos-list">
        {#if loading}
            <div class="skeleton-list">
                {#each Array(3) as _}
                    <div class="skeleton-item"></div>
                {/each}
            </div>
        {:else if repositories.length === 0}
            <div class="empty-state">
                <svg
                    class="empty-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                </svg>
                <p class="empty-text">No repositories found</p>
            </div>
        {:else}
            {#each repositories as repo}
                <div class="repo-item">
                    <div class="repo-content">
                        <div class="repo-info">
                            <svg
                                class="repo-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                            </svg>
                            <h3 class="repo-name">{repo.name}</h3>
                        </div>

                        <button
                            type="button"
                            on:click={() => cloneRepository(repo.id, repo.name)}
                            class="btn btn-secondary btn-sm"
                            aria-label={`Clone ${repo.name}`}
                        >
                            <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            <span>Clone</span>
                        </button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</section>

<style>
    .repos-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .section-icon {
        width: 1.25rem;
        height: 1.25rem;
        color: rgba(255, 255, 255, 0.4);
        flex-shrink: 0;
    }

    .section-title {
        font-family: "Jost", sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
        margin: 0;
        letter-spacing: -0.01em;
    }

    .repo-count {
        font-size: 0.8125rem;
        color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.05);
        padding: 0.125rem 0.5rem;
        border-radius: 0.25rem;
        font-weight: 600;
    }

    .repos-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .skeleton-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .skeleton-item {
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.02);
        height: 4rem;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .empty-state {
        text-align: center;
        padding: 2rem 0;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
    }

    .empty-icon {
        width: 3rem;
        height: 3rem;
        margin: 0 auto 0.5rem;
        opacity: 0.5;
    }

    .empty-text {
        font-size: 0.875rem;
        margin: 0;
    }

    .repo-item {
        padding: 1rem 1.25rem;
        border-radius: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #1c1c1c;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .repo-item:hover {
        background: #252525;
        border-color: rgba(255, 255, 255, 0.12);
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    .repo-content {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
    }

    .repo-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        min-width: 0;
    }

    .repo-icon {
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
    }

    .repo-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-txt-main, #fff);
        margin: 0;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
        transition: all 0.15s ease;
        border: 1px solid transparent;
        user-select: none;
        cursor: pointer;
    }

    .btn-sm {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        gap: 0.375rem;
    }

    .btn-secondary {
        color: white;
        background: #7c3aed;
        border-color: #6d28d9;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
    }

    .btn-secondary:hover {
        background: #8b5cf6;
        border-color: #7c3aed;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }

    .btn-secondary:active {
        transform: translateY(0);
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
</style>
