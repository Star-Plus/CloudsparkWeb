<script lang="ts">
    import { onMount } from "svelte";
    import Icon from "@iconify/svelte";
    import UserSearchService from "$lib/features/search/UserSearchService";
    import CollaborationService from "$lib/features/collaboration/services/CollaborationService";
    import type { CollaboratorUser } from "$lib/features/collaboration/dtos/CollaborationDtos";
    import type Repository from "$lib/features/repos/Repository";

    export let repo: Repository | null = null;

    let searchQuery = "";
    let searchResults: CollaboratorUser[] = [];
    let isSearching = false;
    let collaborators: CollaboratorUser[] = [];
    let selectedCollaborators = new Set<string>();
    const collabService = new CollaborationService();

    // Confirmation modal state
    let showConfirmAdd = false;
    let pendingAddUser: CollaboratorUser | null = null;
    let isConfirming = false;

    const SEARCH_LIMIT = 5;

    onMount(async () => {
        const remoteId = repo?.remoteId;
        if (!remoteId) return;

        try {
            const usernames = await CollaborationService.listCollaborators(remoteId);
            if (usernames.length > 0) {
                const users = await CollaborationService.getCollaboratorUsers(usernames);
                collaborators = users ?? [];
            }
        } catch (error) {
            console.error("Failed to load collaborators:", error);
        }
    });

    async function handleSearch() {
        if (!searchQuery.trim()) {
            searchResults = [];
            return;
        }

        isSearching = true;
        try {
            const results = await UserSearchService.searchUsers(searchQuery, SEARCH_LIMIT);

            searchResults = results || [];
        } catch (error) {
            console.error("Search error:", error);
            searchResults = [];
        } finally {
            isSearching = false;
        }
    }

    async function handleAddCollaborator(user: CollaboratorUser) {
        const remoteId = repo?.remoteId;
        if (!remoteId) return;

        try {
            await collabService.addCollaborator(remoteId, user.username);
            if (!collaborators.find((c) => c.username === user.username)) {
                collaborators = [...collaborators, user];
                selectedCollaborators.add(user.username);
            }
        } catch (error) {
            console.error("Failed to add collaborator:", error);
        } finally {
            searchQuery = "";
            searchResults = [];
        }
    }

    function handleRemoveCollaborator(username: string) {
        collaborators = collaborators.filter((c) => c.username !== username);
        selectedCollaborators.delete(username);
    }

    async function handleSave() {
        if (!repo) return;

        try {
            console.log("Collaborators saved:", collaborators);
        } catch (error) {
            console.error("Failed to save collaborators:", error);
        }
    }
</script>

<div class="collaborators-container">
    <div class="section-card">
        <div class="section-header">
            <h4 class="section-title">Collaborators</h4>
            <p class="section-description">Manage who can access and contribute to this remote.</p>
        </div>

        <div class="section-content">
            <!-- Search Input -->
            <div class="search-section">
                <label class="input-label" for="collab-search">Add collaborators</label>

                <div class="search-input-wrapper">
                    <input
                        id="collab-search"
                        type="text"
                        class="form-input"
                        placeholder="Search by username..."
                        bind:value={searchQuery}
                        on:input={handleSearch}
                    />
                    {#if isSearching}
                        <svg class="search-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    {/if}
                </div>

                <!-- Search Results -->
                {#if searchResults.length > 0}
                    <div class="search-results">
                        {#each searchResults as user (user.username)}
                            <button
                                class="search-result-item"
                                on:click={() => { pendingAddUser = user; showConfirmAdd = true; }}
                                type="button"
                            >
                                {#if user.avatarUrl}
                                    <img src={user.avatarUrl} alt={user.username} class="user-avatar" />
                                {:else}
                                    <div class="user-avatar-placeholder">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                {/if}
                                <span class="search-result-username">{user.username}</span>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Current Collaborators List -->
            <div class="collaborators-list-section">
                <div class="list-header">
                    <p class="list-count">
                        {collaborators.length > 0 ? `${collaborators.length} collaborator${collaborators.length !== 1 ? "s" : ""}` : "No collaborators added yet"}
                    </p>
                </div>

                {#if collaborators.length > 0}
                    <div class="collaborators-items">
                        {#each collaborators as collaborator (collaborator.username)}
                            <div class="collaborator-item">
                                <div class="collaborator-info">
                                    {#if collaborator.avatarUrl}
                                        <img src={collaborator.avatarUrl} alt={collaborator.username} class="collaborator-avatar" />
                                    {:else}
                                        <div class="collaborator-avatar-placeholder">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    {/if}
                                    <span class="collaborator-username">{collaborator.username}</span>
                                </div>
                                <button
                                    class="btn-icon-delete"
                                    on:click={() => handleRemoveCollaborator(collaborator.username)}
                                    title="Remove collaborator"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-section">
        <button
            type="button"
            class="btn btn-primary"
            on:click={handleSave}
        >
            Save Changes
        </button>
    </div>

    <!-- Add Collaborator Confirmation Modal -->
    {#if showConfirmAdd && pendingAddUser}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="modal-backdrop" on:click={() => { showConfirmAdd = false; pendingAddUser = null; }}>
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="confirmation-modal" on:click|stopPropagation>
                <div class="modal-header">
                    <h5 class="modal-title underline decoration-white/20 decoration-2 underline-offset-4">Add Collaborator</h5>
                    <button
                        type="button"
                        class="modal-close"
                        on:click={() => { showConfirmAdd = false; pendingAddUser = null; }}
                        disabled={isConfirming}
                        title="Close"
                    >
                        <Icon icon="mdi:close" class="size-5" />
                    </button>
                </div>

                <div class="modal-content">
                    <div class="user-confirmation-block">
                        {#if pendingAddUser.avatarUrl}
                            <img src={pendingAddUser.avatarUrl} alt={pendingAddUser.username} class="confirm-avatar" />
                        {:else}
                            <div class="confirm-avatar-placeholder">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        {/if}
                        <div class="user-confirmation-info">
                            <p class="confirm-username">{pendingAddUser.username}</p>
                            <p class="confirm-message">Add as collaborator?</p>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        on:click={() => { showConfirmAdd = false; pendingAddUser = null; }}
                        disabled={isConfirming}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        class="btn btn-primary"
                        on:click={async () => { if (pendingAddUser) { isConfirming = true; await handleAddCollaborator(pendingAddUser); isConfirming = false; showConfirmAdd = false; pendingAddUser = null; } }}
                        disabled={isConfirming}
                    >
                        {#if isConfirming}
                            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Adding...</span>
                        {:else}
                            Confirm
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .collaborators-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .section-card {
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        background: #0e0e0e;
        overflow: hidden;
    }

    .section-header {
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .section-title {
        font-family: 'Jost', sans-serif;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-txt-main, #fff);
        margin: 0 0 0.25rem 0;
    }

    .section-description {
        font-size: 0.75rem;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        margin: 0;
    }

    .section-content {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .search-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        position: relative;
    }

    .input-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
    }

    .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .form-input {
        width: 100%;
        padding: 0.625rem 1rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: var(--color-txt-main, #fff);
        font-size: 0.875rem;
        transition: all 0.15s ease;
    }

    .form-input::placeholder {
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.4));
    }

    .form-input:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
    }

    .search-spinner {
        position: absolute;
        right: 0.75rem;
        width: 1.25rem;
        height: 1.25rem;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        animation: spin 1s linear infinite;
    }

    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 0.5rem;
        background: #121212;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 0.375rem;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.82);
        z-index: 10;
        display: flex;
        flex-direction: column;
        max-height: 200px;
        overflow-y: auto;
    }

    .search-result-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border: none;
        background: transparent;
        color: var(--color-txt-main, #fff);
        text-align: left;
        cursor: pointer;
        transition: background 0.15s ease;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .search-result-item:hover {
        background: rgba(255, 255, 255, 0.06);
    }

    .search-result-item:last-child {
        border-bottom: none;
    }

    .user-avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.5rem;
        object-fit: cover;
        flex-shrink: 0;
    }

    .user-avatar-placeholder {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        flex-shrink: 0;
    }

    .search-result-username {
        font-size: 0.875rem;
        font-weight: 500;
    }

    .collaborators-list-section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding-top: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .list-header {
        padding: 0 0 0.5rem 0;
    }

    .list-count {
        font-size: 0.75rem;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        margin: 0;
        font-weight: 500;
    }

    .collaborators-items {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .collaborator-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem;
        border-radius: 0.375rem;
        background: rgba(255, 255, 255, 0.01);
        border: 1px solid transparent;
        transition: all 0.1s ease;
    }

    .collaborator-item:hover {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.05);
    }

    .collaborator-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
        min-width: 0;
    }

    .collaborator-avatar {
        width: 2rem;
        height: 2rem;
        border-radius: 0.375rem;
        object-fit: cover;
        flex-shrink: 0;
    }

    .collaborator-avatar-placeholder {
        width: 2rem;
        height: 2rem;
        border-radius: 0.375rem;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        flex-shrink: 0;
    }

    .collaborator-username {
        font-size: 0.875rem;
        color: var(--color-txt-main, #fff);
        font-weight: 500;
    }

    .btn-icon-delete {
        width: 1.75rem;
        height: 1.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.375rem;
        border: none;
        background: transparent;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        cursor: pointer;
        transition: all 0.15s ease;
        flex-shrink: 0;
    }

    .btn-icon-delete:hover {
        background: rgba(239, 68, 68, 0.12);
        color: #f87171;
    }

    .action-section {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
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

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-secondary {
        color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
        background: transparent;
        border-color: rgba(255, 255, 255, 0.15);
    }

    .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.25);
    }

    .btn-secondary:active:not(:disabled) {
        transform: scale(0.98);
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
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }

    .btn-primary:active:not(:disabled) {
        transform: translateY(0);
    }

    /* Modal Styles */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
    }

    .confirmation-modal {
        background: #0e0e0e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 0.5rem;
        box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
        width: 100%;
        max-width: 400px;
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .modal-title {
        font-family: 'Jost', sans-serif;
        font-size: 1.125rem;
        font-weight: 700;
        color: white;
        margin: 0;
        letter-spacing: -0.01em;
    }

    .modal-close {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        border: none;
        background: transparent;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .modal-close:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.06);
        color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
    }

    .modal-close:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .modal-content {
        padding: 1.5rem;
    }

    .user-confirmation-block {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .confirm-avatar {
        width: 3rem;
        height: 3rem;
        border-radius: 0.5rem;
        object-fit: cover;
        flex-shrink: 0;
    }

    .confirm-avatar-placeholder {
        width: 3rem;
        height: 3rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        flex-shrink: 0;
    }

    .user-confirmation-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .confirm-username {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-txt-main, #fff);
        margin: 0;
    }

    .confirm-message {
        font-size: 0.75rem;
        color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
        margin: 0;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.02);
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    :global(.animate-spin) {
        animation: spin 1s linear infinite;
    }
</style>