<script lang="ts">
    import type Repository from "../Repository";
    import Icon from "@iconify/svelte";
    import DateFormatter from "$lib/utils/formaters/DateFormater";
    import SizeFormatter from "$lib/utils/formaters/SizeFormatter";
    import UnmountRepository from "../unmount/UnmountRepository";
    import { goto } from "$app/navigation";

    export let repo: Repository;
    export let onEdit: (r: Repository) => void;
    export let onRefresh: (r: Repository) => void;

    let showDeleteModal = false;
    let isDeleting = false;

    function openRepo() {
        goto(`/repos/${repo.getId}`);
    }

    function openDeleteModal() {
        showDeleteModal = true;
    }

    function closeDeleteModal() {
        showDeleteModal = false;
    }

    async function handleDelete(purge: boolean) {
        isDeleting = true;
        try {
            await UnmountRepository(repo.getId, purge);
            closeDeleteModal();
        } catch (error) {
            console.error("Failed to delete repository:", error);
        } finally {
            isDeleting = false;
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article
    class="repo-card group"
    on:click={openRepo}
    
>
    <div class="card-header">
        <div class="repo-info">
            <span class="repo-emoji">{repo.emoji}</span>
            <div class="repo-details">
                <h3 class="repo-name">{repo.shortName}</h3>
            </div>
        </div>
        <div class="card-actions">
            <button
                title="Edit"
                class="action-btn"
                on:click|stopPropagation={() => onEdit(repo)}
            >
                <Icon icon="solar:pen-new-round-bold" />
            </button>
            <button
                title="Refresh"
                class="action-btn"
                on:click|stopPropagation={() => onRefresh(repo)}
            >
                <Icon icon="solar:refresh-circle-bold" />
            </button>
            <button
                title="Delete"
                class="action-btn action-btn-danger"
                on:click|stopPropagation={openDeleteModal}
            >
                <Icon icon="solar:trash-bin-2-bold" />
            </button>
        </div>
    </div>

    <!-- Primary metadata: frequently checked information -->
    <div class="metadata-group">
        <div class="metadata-row">
            <Icon icon="mdi:database-outline" class="group-icon" />
            <span class="metadata-value">
                {#if repo.storageUsedInBytes !== null}
                    {SizeFormatter.formatBytes(repo.storageUsedInBytes)}
                {:else}
                    Calculating...
                {/if}
            </span>
        </div>
        <div class="metadata-row">
            <Icon icon="mdi:update" class="group-icon" />
            <span class="metadata-value" title={`Last updated ${new Date(repo.updatedAt).toLocaleString()}`}>
                {DateFormatter.toUIString(new Date(repo.updatedAt))}
            </span>
        </div>
    </div>

    <!-- Secondary metadata: less frequently checked -->
    <div class="metadata-group metadata-group-secondary">
        <div class="metadata-row">
            <Icon icon="mdi:calendar-clock" class="group-icon" />
            <span class="metadata-label">Created</span>
            <span class="metadata-value" title={`Created ${new Date(repo.createdAt).toLocaleString()}`}>
                {DateFormatter.toUIString(new Date(repo.createdAt))}
            </span>
        </div>
    </div>

    <!-- Tertiary: path information -->
    <div class="card-path">
        <Icon icon="mdi:folder-outline" class="path-icon" />
        <span class="path-text" title={repo.path}>{repo.path}</span>
    </div>
</article>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="modal-backdrop"
        on:click={closeDeleteModal}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="modal-content"
            on:click|stopPropagation
        >
            <div class="modal-header">
                <Icon icon="mdi:alert-circle-outline" class="modal-icon-warning" />
                <h3 class="modal-title">Delete Repository</h3>
            </div>
            <p class="modal-description">
                Delete <span class="highlight">{repo.shortName}</span>?
            </p>
            
            <div class="modal-options">
                <label class="option-item">
                    <input 
                        type="radio" 
                        name="delete-option" 
                        value="unmount"
                        checked
                        class="option-radio"
                    />
                    <div class="option-content">
                        <div class="option-label">Unmount</div>
                        <p class="option-description">Remove from app (files remain)</p>
                    </div>
                </label>

                <label class="option-item">
                    <input 
                        type="radio" 
                        name="delete-option" 
                        value="purge"
                        class="option-radio option-radio-danger"
                    />
                    <div class="option-content">
                        <div class="option-label option-label-danger">Purge</div>
                        <p class="option-description">Delete all files permanently</p>
                    </div>
                </label>
            </div>

            <div class="modal-actions">
                <button
                    class="btn btn-secondary"
                    on:click={closeDeleteModal}
                    disabled={isDeleting}
                >
                    Cancel
                </button>
                <button
                    class="btn btn-danger"
                    on:click={() => {
                        const option = document.querySelector('input[name="delete-option"]:checked') as HTMLInputElement;
                        handleDelete(option?.value === 'purge');
                    }}
                    disabled={isDeleting}
                >
                    <Icon icon="solar:trash-bin-2-bold" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .repo-card {
        background: #1c1c1c;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 1.125rem;
        padding: 1.25rem;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: blur(10px);
        position: relative;
        overflow: hidden;
    }

    .repo-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.05), transparent 60%);
        opacity: 0;
        transition: opacity 0.4s ease;
    }

    .repo-card:hover {
        background: #252525;
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-4px);
        box-shadow: 0 15px 35px -12px rgba(0, 0, 0, 0.8);
    }

    .repo-card:hover::before {
        opacity: 1;
    }

    .card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.125rem;
    }

    .repo-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 0;
        flex: 1;
    }

    .repo-emoji {
        font-size: 1.75rem;
        line-height: 1;
        user-select: none;
        flex-shrink: 0;
    }

    .repo-details {
        min-width: 0;
        flex: 1;
    }

    .repo-name {
        font-family: 'Jost', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
        line-height: 1.2;
        margin: 0;
        letter-spacing: -0.01em;
    }

    .card-actions {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex-shrink: 0;
    }

    .action-btn {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.04);
        background: #121212;
        color: var(--color-txt-muted, rgba(255,255,255,0.5));
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 1rem;
        z-index: 100;
    }

    .action-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }

    .action-btn-danger:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
    }

    /* Metadata groups - clear visual hierarchy */
    .metadata-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0.875rem;
    }

    .metadata-group-secondary {
        margin-bottom: 0.75rem;
    }

    .metadata-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8125rem;
        color: var(--color-txt-muted, rgba(255,255,255,0.6));
    }

    .metadata-label {
        font-size: 0.75rem;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 0.025em;
    }

    .metadata-value {
        font-weight: 500;
    }

    .card-path {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-top: 0.875rem;
        border-top: 1px solid rgba(255,255,255,0.03);
        font-size: 0.7rem;
        color: var(--color-txt-muted, rgba(255,255,255,0.3));
    }

    .path-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        min-width: 0;
        font-family: inherit;
        opacity: 0.8;
    }

    button { 
        cursor: pointer; 
    }

    /* Modal styles */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
    }

    .modal-content {
        background: #1c1c1c;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
        width: 100%;
        max-width: 400px;
        padding: 1.5rem;
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
    }

    .modal-title {
        font-family: 'Jost', sans-serif;
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--color-txt-main, #fff);
        letter-spacing: -0.01em;
    }

    .modal-description {
        font-size: 0.875rem;
        color: var(--color-txt-muted, rgba(255,255,255,0.7));
        margin-bottom: 1.25rem;
    }

    .highlight {
        font-weight: 600;
        color: var(--color-txt-main, #fff);
    }

    .modal-options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
    }

    .option-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: background 0.15s ease;
    }

    .option-item:hover {
        background: rgba(255, 255, 255, 0.04);
    }

    .option-radio {
        margin-top: 0.125rem;
        accent-color: white;
        cursor: pointer;
    }

    .option-radio-danger {
        accent-color: #ef4444;
    }

    .option-content {
        flex: 1;
    }

    .option-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-txt-main, #fff);
        margin-bottom: 0.25rem;
    }

    .option-label-danger {
        color: #fca5a5;
    }

    .option-description {
        font-size: 0.75rem;
        color: var(--color-txt-muted, rgba(255,255,255,0.5));
        margin: 0;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
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
        color: var(--color-txt-main, rgba(255,255,255,0.9));
        background: #121212;
        border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.25);
    }

    .btn-danger {
        color: white;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border-color: #dc2626;
    }

    .btn-danger:hover:not(:disabled) {
        background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    }
</style>