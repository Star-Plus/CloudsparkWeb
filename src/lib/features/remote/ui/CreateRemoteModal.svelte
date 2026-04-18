<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import Icon from "@iconify/svelte";
    import RemoteService from "../RemoteService";
    import type Repository from "../../repos/Repository";
    import RepositoryStore from "../../repos/RepositoryStore";

    const remoteService = new RemoteService();
    const dispatch = createEventDispatcher();

    export let isOpen = false;
    export let repo: Repository | null = null;
    export let onClose: (() => void) | null = null;

    let remoteName = "";
    let isPublic = false;
    let saving = false;
    let errorMessage: string | null = null;

    // Initialize remoteName when repo changes or modal opens
    $: if (isOpen && repo) {
        remoteName = repo.shortName ?? repo.getId;
        isPublic = false;
        errorMessage = null;
    }

    function closeModal() {
        isOpen = false;
        errorMessage = null;
        if (onClose) onClose();
        dispatch("close");
    }

    async function handleCreateRemote() {
        if (!repo) return;

        const trimmedName = remoteName.trim();
        if (!trimmedName) {
            errorMessage = "Remote name is required.";
            return;
        }

        saving = true;
        errorMessage = null;

        try {
            const response = await remoteService.createRemote({
                remoteName: trimmedName,
                public: isPublic,
            });

            repo.remoteId = response.remoteID;
            const store = RepositoryStore.getInstance();
            store.updateRepository(repo.getId, repo);

            closeModal();
            dispatch("success", { remoteId: response.remoteID });
        } catch (error) {
            console.error("Failed to create remote", error);
            errorMessage = "Failed to create remote. Please try again.";
        } finally {
            saving = false;
        }
    }
</script>

{#if isOpen}
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
                <h3 class="modal-title underline decoration-white/20 decoration-2 underline-offset-4">Create Remote</h3>
                <button class="modal-close" on:click={closeModal} title="Close">
                    <Icon icon="mdi:close" class="size-5" />
                </button>
            </div>

            <form class="modal-form" on:submit|preventDefault={handleCreateRemote}>
                <!-- Remote Name Section -->
                <div class="form-section">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label class="form-label">Remote name</label>
                    <input
                        class="form-input"
                        type="text"
                        bind:value={remoteName}
                        placeholder="e.g. origin"
                        required
                    />
                </div>

                <!-- Public Option Section -->
                <div class="form-section">
                    <label class="checkbox-label">
                        <input
                            type="checkbox"
                            bind:checked={isPublic}
                            class="checkbox-input"
                        />
                        <span>Make remote public</span>
                    </label>
                </div>

                <!-- Error Message -->
                {#if errorMessage}
                    <div class="error-message">
                        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                {/if}
            </form>

            <!-- Action Buttons -->
            <div class="modal-actions">
                <button
                    type="button"
                    class="btn btn-secondary"
                    on:click={closeModal}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={saving}
                    on:click={handleCreateRemote}
                >
                    {saving ? "Creating..." : "Create remote"}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 40;
    }

    .modal-content {
        background: #0e0e0e;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
        width: 100%;
        max-width: 500px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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

    .modal-close:hover {
        background: rgba(255, 255, 255, 0.06);
        color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
    }

    .modal-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
    }

    .form-section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .form-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-txt-main, #fff);
    }

    .form-input {
        padding: 0.75rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--color-txt-main, #fff);
        font-family: inherit;
        font-size: 0.875rem;
        transition: all 0.15s ease;
    }

    .form-input:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.05);
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
        color: var(--color-txt-main, #fff);
        cursor: pointer;
        user-select: none;
    }

    .checkbox-input {
        appearance: none;
        -webkit-appearance: none;
        width: 1.25rem;
        height: 1.25rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 0.375rem;
        background: transparent;
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
        flex-shrink: 0;
    }

    .checkbox-input:hover {
        border-color: rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.05);
    }

    .checkbox-input:focus {
        outline: 2px solid rgba(255, 255, 255, 0.3);
        outline-offset: 2px;
    }

    .checkbox-input:active {
        transform: scale(0.95);
    }

    .checkbox-input:checked {
        background: white;
        border-color: white;
    }

    .checkbox-input:checked::after {
        content: "";
        position: absolute;
        inset: 0.1rem;
        background: white;
        -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z'/%3E%3C/svg%3E")
            center / contain no-repeat;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z'/%3E%3C/svg%3E")
            center / contain no-repeat;
    }

    .error-message {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-radius: 0.5rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        font-size: 0.875rem;
    }

    .error-icon {
        width: 1.25rem;
        height: 1.25rem;
        flex-shrink: 0;
        margin-top: 0.125rem;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.02);
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
</style>
