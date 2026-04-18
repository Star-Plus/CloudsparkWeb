<script lang="ts">
    import CommitApi from "$lib/features/repos/commit/CommitApi";
    import RepositoryStore from "$lib/features/repos/RepositoryStore";
    import CheckoutApi from "./CheckoutApi";
    import Icon from "@iconify/svelte";
    import { fade, scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    export let repoId: string;
    export let closeTab: () => void;

    let repoPath: string | null = null;
    let commitHistory: string[] = [];
    let selectedCommit: string | null = null;

    let isLoading = false;
    let isCheckingOut = false;
    let loadedRepoId: string | null = null;

    let errorMessage: string | null = null;
    let successMessage: string | null = null;

    function closeModal(): void {
        closeTab();
    }

    function getShortHash(hash: string): string {
        return hash.length > 12 ? hash.slice(0, 12) : hash;
    }

    function selectCommit(commitHash: string): void {
        selectedCommit = commitHash;
        successMessage = null;
        errorMessage = null;
    }

    async function loadCommitHistory(): Promise<void> {
        if (!repoId) {
            errorMessage = "Repository ID is missing.";
            return;
        }

        const repo = RepositoryStore.getInstance().getRepository(repoId);

        if (!repo) {
            repoPath = null;
            commitHistory = [];
            selectedCommit = null;
            errorMessage = "Repository not found.";
            return;
        }

        repoPath = repo.path;
        isLoading = true;
        errorMessage = null;
        successMessage = null;

        try {
            const history = await CommitApi.getCommitHistory(repo.path);

            // Backend returns oldest -> newest, so reverse for a better UX.
            commitHistory = [...history].reverse();

            if (selectedCommit && !commitHistory.includes(selectedCommit)) {
                selectedCommit = null;
            }
        } catch (error) {
            console.error("Failed to load commit history", error);
            errorMessage = "Failed to load commit history. Please try again.";
            commitHistory = [];
            selectedCommit = null;
        } finally {
            isLoading = false;
        }
    }

    async function handleCheckout(): Promise<void> {
        if (!repoPath || !selectedCommit) {
            errorMessage = "Please select a commit to checkout.";
            return;
        }

        isCheckingOut = true;
        errorMessage = null;
        successMessage = null;

        try {
            await CheckoutApi.checkoutCommit(repoPath, selectedCommit);
            successMessage = `Checked out ${getShortHash(selectedCommit)} successfully.`;
            setTimeout(() => {
                closeModal();
            }, 450);
        } catch (error) {
            console.error("Failed to checkout commit", error);
            errorMessage = "Failed to checkout selected commit. Please try again.";
        } finally {
            isCheckingOut = false;
        }
    }

    $: if (repoId && repoId !== loadedRepoId) {
        loadedRepoId = repoId;
        loadCommitHistory();
    }

</script>

{#if repoId}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="modal-backdrop"
        on:click={closeModal}
        transition:fade={{ duration: 300 }}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="modal-content"
            on:click|stopPropagation
            transition:scale={{ duration: 500, start: 0.92, opacity: 0, easing: cubicOut }}
        >
            <div class="modal-header">
                <div class="header-content">
                    <h2 class="modal-title">Commit History</h2>
                    <p class="modal-subtitle">Select a commit and checkout your repository state</p>
                </div>
                <button
                    type="button"
                    class="modal-close"
                    on:click={closeModal}
                    disabled={isCheckingOut}
                    title="Close"
                >
                    <Icon icon="mdi:close" width="20" height="20" />
                </button>
            </div>

            {#if errorMessage}
                <div class="error-message">
                    <Icon icon="mdi:alert-circle-outline" width="18" height="18" />
                    <span>{errorMessage}</span>
                </div>
            {/if}

            {#if successMessage}
                <div class="success-message">
                    <Icon icon="mdi:check-circle-outline" width="18" height="18" />
                    <span>{successMessage}</span>
                </div>
            {/if}

            <div class="modal-body">
                <div class="section-header">
                    <h3 class="section-title">Commits</h3>
                    <button
                        type="button"
                        class="btn btn-secondary"
                        on:click={loadCommitHistory}
                        disabled={isLoading || isCheckingOut}
                    >
                        {#if isLoading}
                            <Icon icon="mdi:loading" class="animate-spin" width="16" height="16" />
                            Loading...
                        {:else}
                            <Icon icon="mdi:refresh" width="16" height="16" />
                            Refresh
                        {/if}
                    </button>
                </div>

                <div class="history-container">
                    {#if isLoading}
                        <div class="empty-state">
                            <Icon icon="mdi:loading" class="animate-spin" width="30" height="30" />
                            <p>Loading commit history...</p>
                        </div>
                    {:else if commitHistory.length === 0}
                        <div class="empty-state">
                            <Icon icon="mdi:source-commit" width="36" height="36" />
                            <p>No commits found for this repository.</p>
                        </div>
                    {:else}
                        <div class="commit-list">
                            {#each commitHistory as commitHash}
                                <button
                                    type="button"
                                    class="commit-item"
                                    class:is-selected={selectedCommit === commitHash}
                                    on:click={() => selectCommit(commitHash)}
                                >
                                    <div class="commit-main">
                                        <span class="commit-short">{getShortHash(commitHash)}</span>
                                        {#if selectedCommit === commitHash}
                                            <span class="selected-tag">
                                                <Icon icon="mdi:check" width="14" height="14" />
                                                Selected
                                            </span>
                                        {/if}
                                    </div>
                                    <span class="commit-full">{commitHash}</span>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    class="btn btn-secondary"
                    on:click={closeModal}
                    disabled={isCheckingOut}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    class="btn btn-primary"
                    on:click={handleCheckout}
                    disabled={!selectedCommit || isLoading || isCheckingOut}
                >
                    {#if isCheckingOut}
                        <Icon icon="mdi:loading" class="animate-spin" width="16" height="16" />
                        Checking out...
                    {:else}
                        <Icon icon="mdi:source-branch" width="16" height="16" />
                        {#if selectedCommit}
                            Checkout {getShortHash(selectedCommit)}
                        {:else}
                            Checkout Commit
                        {/if}
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        padding: 1rem;
    }

    .modal-content {
        background: #0e0e0e;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
        width: 100%;
        max-width: 760px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .header-content {
        flex: 1;
    }

    .modal-title {
        font-family: 'Jost', sans-serif;
        font-size: 1.125rem;
        font-weight: 700;
        color: white;
        margin: 0 0 0.2rem 0;
        letter-spacing: -0.01em;
    }

    .modal-subtitle {
        margin: 0;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
        font-size: 0.92rem;
    }

    .modal-close {
        width: 2.25rem;
        height: 2.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        border: none;
        background: rgba(255, 255, 255, 0.04);
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .modal-close:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.08);
        color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
    }

    .modal-close:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .error-message,
    .success-message {
        margin: 0.9rem 2rem 0 2rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 0.5rem;
        padding: 0.7rem 0.9rem;
        font-size: 0.9rem;
    }

    .error-message {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.35);
        color: rgba(252, 165, 165, 1);
    }

    .success-message {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.35);
        color: rgba(134, 239, 172, 1);
    }

    .modal-body {
        padding: 1.25rem 2rem;
        overflow-y: auto;
        min-height: 20rem;
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.9rem;
        gap: 1rem;
    }

    .section-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 600;
        font-size: 0.95rem;
    }

    .history-container {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.02);
        border-radius: 0.5rem;
        min-height: 16rem;
        max-height: 48vh;
        overflow: auto;
    }

    .empty-state {
        min-height: 16rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: rgba(255, 255, 255, 0.55);
        text-align: center;
        padding: 1.5rem;
    }

    .empty-state p {
        margin: 0;
    }

    .commit-list {
        display: flex;
        flex-direction: column;
    }

    .commit-item {
        width: 100%;
        border: none;
        background: transparent;
        color: inherit;
        text-align: left;
        padding: 0.85rem 0.95rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.28rem;
        transition: background 0.15s ease;
    }

    .commit-item:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .commit-item.is-selected {
        background: rgba(124, 58, 237, 0.18);
        border-left: 2px solid rgba(139, 92, 246, 0.95);
        padding-left: calc(0.95rem - 2px);
    }

    .commit-main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.8rem;
    }

    .commit-short {
        color: rgba(255, 255, 255, 0.95);
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        font-family: "JetBrains Mono", monospace;
    }

    .commit-full {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.78rem;
        font-family: "JetBrains Mono", monospace;
        line-height: 1.45;
        word-break: break-all;
    }

    .selected-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.28rem;
        font-size: 0.72rem;
        font-weight: 600;
        border-radius: 9999px;
        padding: 0.18rem 0.55rem;
        color: #ddd6fe;
        border: 1px solid rgba(167, 139, 250, 0.35);
        background: rgba(109, 40, 217, 0.3);
    }

    .modal-actions {
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding: 1rem 2rem;
        display: flex;
        justify-content: flex-end;
        gap: 0.6rem;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        border-radius: 0.5rem;
        padding: 0.55rem 0.95rem;
        font-size: 0.9rem;
        font-weight: 600;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-primary {
        color: white;
        background: #7c3aed;
        border-color: #6d28d9;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
        background: #8b5cf6;
        border-color: #7c3aed;
    }

    .btn-secondary {
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
    }

    .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.25);
    }

    :global(.animate-spin) {
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 768px) {
        .modal-content {
            max-width: 100%;
            max-height: 94vh;
        }

        .modal-header,
        .modal-body,
        .modal-actions {
            padding-left: 1rem;
            padding-right: 1rem;
        }

        .error-message,
        .success-message {
            margin-left: 1rem;
            margin-right: 1rem;
        }

        .modal-actions {
            flex-direction: column-reverse;
        }

        .btn {
            width: 100%;
            justify-content: center;
        }
    }
</style>