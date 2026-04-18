<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import CreateRemoteModal from "$lib/features/remote/ui/CreateRemoteModal.svelte";

    import Icon from "@iconify/svelte";
    import { fade, scale, fly } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import type Repository from "../Repository";
    import RepositoryStore from "../RepositoryStore";
    import UploadChangesButton from "$lib/features/remote/ui/UploadChangesButton.svelte";

    let repoId = $page.params.repoId;
    let repo: Repository | null = null;

    let showCreateRemoteModal = false;
    let showOverflowMenu = false;
    let showRemoveConfirm = false;
    export let handleActiveTab: (tab: string | null) => void;

    onMount(() => {
        if (!repoId) {
            console.error("No repository ID provided in route parameters.");
            return;
        }

        const repoStore = RepositoryStore.getInstance();
        repo = repoStore.getRepository(repoId) || null;

        if (!repo) {
            console.error("Repository not found for ID:", repoId);
            return;
        }
    });

    function openCreateRemoteModal() {
        showCreateRemoteModal = true;
    }

    function closeCreateRemoteModal() {
        showCreateRemoteModal = false;
    }

    function handleRemoveRemote() {
        if (!repo) return;
        repo.remoteId = null;
        const store = RepositoryStore.getInstance();
        store.updateRepository(repo.getId, repo);
        showRemoveConfirm = false;
        showOverflowMenu = false;
    }

    
</script>

<section class="font-primary text-txt-main">
    {#if repo}
        <div class="action-bar">
            <!-- Action buttons - clear hierarchy -->
            <div class="actions">
                <!-- Primary action: Modify -->
                <button
                    class="btn btn-primary"
                    on:click={() => handleActiveTab("modify")}
                    title="Modify repository"
                >
                    <Icon icon="mdi:pencil" />
                    <span>Modify</span>
                </button>

                <!-- Secondary actions -->
                {#if !repo.remoteId}
                    <button
                        class="btn btn-secondary"
                        on:click={openCreateRemoteModal}
                        title="Create and link remote repository"
                    >
                        <Icon icon="mdi:cloud-upload" />
                        <span>Create Remote</span>
                    </button>
                {:else}
                    <UploadChangesButton {repo} />    

                    <button
                        class="btn btn-secondary"
                        on:click={() => handleActiveTab("merge")}
                        title="Merge changes from remote"
                    >
                        <Icon icon="mdi:merge" />
                        <span>Merge</span>
                    </button>
                {/if}

                <button class="btn btn-secondary" on:click={() => handleActiveTab("history")} title="View commit history">
                    <Icon icon="mdi:history" />
                    <span>History</span>
                    
                </button>

                <!-- Overflow menu for less common actions -->
                <div class="overflow-menu">
                    <button
                        class="btn btn-icon"
                        on:click={() => (showOverflowMenu = !showOverflowMenu)}
                        title="More actions"
                    >
                        <Icon icon="mdi:dots-vertical" />
                    </button>

                    {#if showOverflowMenu}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            class="menu-backdrop"
                            on:click={() => (showOverflowMenu = false)}
                            transition:fade={{ duration: 150 }}
                        ></div>
                        <div 
                            class="menu-dropdown"
                            transition:fade={{ duration: 150 }}
                        >
                            <button
                                class="menu-item"
                                on:click={() => {
                                    handleActiveTab("ignore");
                                    showOverflowMenu = false;
                                }}
                            >
                                <Icon icon="mdi:file-hidden" />
                                <span>Manage Ignore Rules</span>
                            </button>
                            <button
                                class="menu-item"
                                on:click={() => {
                                    goto(`/repos/${repoId}/settings`);
                                    showOverflowMenu = false;
                                }}
                            >
                                <Icon icon="mdi:cog" />
                                <span>Settings</span>
                            </button>
                            {#if repo.remoteId}
                                <div class="menu-divider"></div>
                                <button
                                    class="menu-item menu-item-danger"
                                    on:click={() => {
                                        showRemoveConfirm = true;
                                        showOverflowMenu = false;
                                    }}
                                >
                                    <Icon icon="mdi:link-off" />
                                    <span>Remove Remote Link</span>
                                </button>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</section>

<!-- Remove Remote Confirmation -->
{#if showRemoveConfirm}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-40"
        on:click={() => (showRemoveConfirm = false)}
        transition:fade={{ duration: 250 }}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="modal-content" 
            on:click|stopPropagation
            transition:scale={{ duration: 400, start: 0.95, easing: cubicOut }}
        >
            <div class="modal-header">
                <h3 class="text-base font-bold text-white font-primary">
                    Remove Remote Link
                </h3>
            </div>
            <p class="text-sm text-txt-muted mb-5">
                This will unlink the remote repository. Your local files will
                not be affected.
            </p>
            <div class="modal-actions">
                <button
                    class="btn btn-secondary"
                    on:click={() => (showRemoveConfirm = false)}
                >
                    Cancel
                </button>
                <button class="btn btn-danger" on:click={handleRemoveRemote}>
                    <Icon icon="mdi:link-off" />
                    <span>Remove Link</span>
                </button>
            </div>
        </div>
    </div>
{/if}

<CreateRemoteModal bind:isOpen={showCreateRemoteModal} {repo} onClose={closeCreateRemoteModal} />

<style>
    .action-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
    }

    /* Actions area */
    .actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    /* Base button */
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

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Primary action - high emphasis */
    .btn-primary {
        color: white;
        background: #7c3aed;
        border-color: #6d28d9;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
        background: #8b5cf6;
        border-color: #7c3aed;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }

    .btn-primary:active:not(:disabled) {
        transform: translateY(0);
    }

    /* Secondary actions - outlined, lower emphasis */
    .btn-secondary {
        color: rgba(255, 255, 255, 0.8);
        background: transparent;
        border-color: rgba(255, 255, 255, 0.1);
    }

    .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.15);
        color: white;
    }

    .btn-secondary:active:not(:disabled) {
        transform: translateY(1px);
    }

    /* Danger action - clear destructive intent */
    .btn-danger {
        color: white;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border-color: #dc2626;
    }

    .btn-danger:hover:not(:disabled) {
        background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    }

    /* Icon-only button */
    .btn-icon {
        padding: 0.5rem;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
        background: transparent;
        border-color: rgba(255, 255, 255, 0.1);
    }

    .btn-icon:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.2);
        color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
    }

    /* Overflow menu */
    .overflow-menu {
        position: relative;
    }

    .menu-backdrop {
        position: fixed;
        inset: 0;
        z-index: 40;
    }

    .menu-dropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        min-width: 220px;
        background: #1c1c1c;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 0.375rem;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        padding: 0.25rem;
        z-index: 50;
    }

    .menu-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.625rem 0.75rem;
        font-size: 0.875rem;
        color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
        background: transparent;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background 0.1s ease;
        text-align: left;
    }

    .menu-item:hover {
        background: rgba(255, 255, 255, 0.05);
        color: white;
    }

    .menu-item-danger {
        color: #fca5a5;
    }

    .menu-item-danger:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #fca5a5;
    }

    .menu-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        margin: 0.375rem 0;
    }

    /* Modal styles */
    .modal-content {
        background: #1c1c1c;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
        padding: 2rem;
        max-width: 420px;
        width: calc(100% - 2rem);
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }

    /* Animation */
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    
</style>
