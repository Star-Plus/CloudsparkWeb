<script lang="ts">
    import CommitApi from "$lib/features/repos/commit/CommitApi";
    import type Repository from "../Repository";
    import StatusService from "../status/StatusService";
    import FILE_STATUS from "../status/STATUS";
    import { fade, scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import Icon from "@iconify/svelte";

    interface StatusEntry {
        name: string;
        status: FILE_STATUS;
    }

    const commitService = new CommitApi();

    export let repo: Repository | null = null;
    export let closeTab: () => void;

    let commitMessage = "";
    let isCommitting = false;
    let isLoadingFiles = false;
    let isFetchingRange = false;
    let errorMessage: string | null = null;
    let trackedFileCount = 0;
    let loadedRepoPath: string | null = null;
    let statusEntries: StatusEntry[] = [];
    let hasMoreStatuses = true;
    let fileListEl: HTMLDivElement | null = null;

    let selectAllChecked = false;
    let manuallySelectedFiles: Set<string> = new Set();
    let selectedFilesCount = 0;
    let manuallyDeselectedFiles: Set<string> = new Set();
    let deselectedFilesCount = 0;

    function getStatusLabel(status: FILE_STATUS): string {
        switch (status) {
            case FILE_STATUS.MODIFIED:
                return "Modified";
            case FILE_STATUS.UNTRACKED:
                return "Untracked";
            case FILE_STATUS.DELETED:
                return "Deleted";
            default:
                return "Unknown";
        }
    }

    function getStatusClass(status: FILE_STATUS): string {
        switch (status) {
            case FILE_STATUS.MODIFIED:
                return "status-modified";
            case FILE_STATUS.UNTRACKED:
                return "status-untracked";
            case FILE_STATUS.DELETED:
                return "status-deleted";
            default:
                return "status-unknown";
        }
    }

    function getStatusTagClass(status: FILE_STATUS): string {
        switch (status) {
            case FILE_STATUS.MODIFIED:
                return "status-tag status-tag-modified";
            case FILE_STATUS.UNTRACKED:
                return "status-tag status-tag-untracked";
            case FILE_STATUS.DELETED:
                return "status-tag status-tag-deleted";
            default:
                return "status-tag status-tag-unknown";
        }
    }

    $: modifiedCount = statusEntries.filter(entry => entry.status === FILE_STATUS.MODIFIED).length;
    $: untrackedCount = statusEntries.filter(entry => entry.status === FILE_STATUS.UNTRACKED).length;
    $: deletedCount = statusEntries.filter(entry => entry.status === FILE_STATUS.DELETED).length;

    function closeModal(): void {
        loadedRepoPath = null;
        closeTab();
    }

    async function loadStatusEntries(): Promise<void> {
        if (!repo) return;

        isLoadingFiles = true;
        errorMessage = null;

        try {
            const entries = await StatusService.getStatus(repo.path, ["*"]);
            statusEntries = entries.map(e => ({ name: e.name, status: e.status }));
            trackedFileCount += entries.length;

        } catch (error) {
            console.error("Failed to load status entries", error);
            errorMessage = "Failed to load changed files. Please try again.";
        } finally {
            isLoadingFiles = false;
        }
    }

    async function handleCommit(): Promise<void> {
        if (!repo || !commitMessage.trim()) {
            errorMessage = "Commit message is required.";
            return;
        }

        if (!selectAllChecked && manuallySelectedFiles.size === 0) {
            errorMessage = "Please select at least one file to commit.";
            return;
        }

        isCommitting = true;
        errorMessage = null;

        try {

            await commitService.commitChanges(repo.path, commitMessage.trim(), selectAllChecked ? manuallyDeselectedFiles : manuallySelectedFiles, selectAllChecked);
            closeModal();
        } catch (error) {
            console.error("Failed to commit changes", error);
            errorMessage = "Failed to commit changes. Please try again.";
        } finally {
            isCommitting = false;
        }
    }

    $: if (repo && repo.path !== loadedRepoPath) {
        loadStatusEntries();
        loadedRepoPath = repo.path;
    }

    function toggleSelectAll(): void {
        
        selectAllChecked = !selectAllChecked;

        manuallyDeselectedFiles = new Set();
        manuallySelectedFiles = new Set();

        if (selectAllChecked) {
            selectedFilesCount = trackedFileCount;
            deselectedFilesCount = 0;
        } else {
            selectedFilesCount = 0;
            deselectedFilesCount = trackedFileCount;
        }
    }

    function toggleFileSelection(fileName: string): void {
        if (selectAllChecked) {
            if (manuallyDeselectedFiles.has(fileName)) {
                manuallyDeselectedFiles.delete(fileName);
            } else {
                manuallyDeselectedFiles.add(fileName);
            }

            if (manuallyDeselectedFiles.size >= trackedFileCount / 2){
                selectAllChecked = false;
                manuallySelectedFiles = new Set(statusEntries.map(e => e.name).filter(name => !manuallyDeselectedFiles.has(name)));
                manuallyDeselectedFiles = new Set();
            }
        } else {
            if (manuallySelectedFiles.has(fileName)) {
                manuallySelectedFiles.delete(fileName);
            } else {
                manuallySelectedFiles.add(fileName);
            }

            if (manuallySelectedFiles.size >= trackedFileCount / 2){
                selectAllChecked = true;
                manuallyDeselectedFiles = new Set(statusEntries.map(e => e.name).filter(name => !manuallySelectedFiles.has(name)));
                manuallySelectedFiles = new Set();
            }
        }

        selectedFilesCount = manuallySelectedFiles.size;
        deselectedFilesCount = manuallyDeselectedFiles.size;
    }
</script>

{#if repo}
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
                <h3 class="modal-title underline decoration-white/20 decoration-2 underline-offset-4">Commit Changes</h3>
                <button class="modal-close" on:click={closeModal} title="Close">
                    <Icon icon="mdi:close" class="size-5" />
                </button>
            </div>

            <form class="modal-form" on:submit|preventDefault={handleCommit}>
                <div class="form-section">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label class="form-label">Commit Message</label>
                    <textarea
                        class="form-input form-textarea"
                        bind:value={commitMessage}
                        placeholder="Describe your changes..."
                        rows="3"
                        required
                    ></textarea>
                </div>

                <div class="form-section">
                    <div class="section-header">
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label class="form-label">Select Files to Commit</label>
                        <div class="section-actions">
                            <button
                                type="button"
                                class="btn btn-ghost"
                                on:click={toggleSelectAll}
                                disabled={statusEntries.length === 0}
                            >
                                {selectAllChecked ? "Deselect All" : "Select All"}
                            </button>
                            <span class="file-count">{selectAllChecked ? trackedFileCount - deselectedFilesCount : selectedFilesCount} / {trackedFileCount} selected</span>
                        </div>
                    </div>

                    {#if statusEntries.length > 0}
                        <div class="status-indicators">
                            <span class="status-tag status-tag-modified">Modified: {modifiedCount}</span>
                            <span class="status-tag status-tag-untracked">Untracked: {untrackedCount}</span>
                            {#if deletedCount > 0}
                                <span class="status-tag status-tag-deleted">Deleted: {deletedCount}</span>
                            {/if}
                        </div>
                    {/if}

                    {#if statusEntries.length > 0}
                        <div class="file-list-container" bind:this={fileListEl}>
                            {#each statusEntries as entry}
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div class="file-list-row">
                                    <input
                                        type="checkbox"
                                        class="file-checkbox"
                                        checked={selectAllChecked ? !manuallyDeselectedFiles.has(entry.name) : manuallySelectedFiles.has(entry.name)}
                                        on:change={() => toggleFileSelection(entry.name)}
                                    />
                                    <span class="status-dot {getStatusClass(entry.status)}"></span>
                                    <span class="file-path">{entry.name}</span>
                                    <span class={getStatusTagClass(entry.status)}>{getStatusLabel(entry.status)}</span>
                                </div>
                            {/each}

                            {#if isFetchingRange}
                                <div class="inline-status-message">Loading more files...</div>
                            {:else if !hasMoreStatuses}
                                <div class="inline-status-message">All changed files are loaded.</div>
                            {/if}
                        </div>
                    {:else if isLoadingFiles}
                        <div class="status-message">Loading changed files...</div>
                    {:else}
                        <div class="status-message">No changed or untracked files found.</div>
                    {/if}
                </div>

                {#if errorMessage}
                    <div class="error-message">
                        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                {/if}

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
                        disabled={isCommitting || isLoadingFiles}
                    >
                        {isCommitting ? "Committing..." : "Commit"}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .modal-content {
        background: #0e0e0e;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
        width: 100%;
        max-width: 600px;
        max-height: 85vh;
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
        color: var(--color-txt-muted, rgba(255,255,255,0.5));
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .modal-close:hover {
        background: rgba(255, 255, 255, 0.06);
        color: var(--color-txt-main, rgba(255,255,255,0.9));
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

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .section-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .form-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-txt-main, #fff);
    }

    .status-indicators {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .file-count {
        font-size: 0.75rem;
        color: var(--color-txt-muted, rgba(255,255,255,0.5));
        background: rgba(255, 255, 255, 0.05);
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
    }

    .btn-ghost {
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: transparent;
        color: var(--color-txt-muted, rgba(255,255,255,0.7));
        border-radius: 0.375rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .btn-ghost:hover {
        background: rgba(255, 255, 255, 0.06);
        color: var(--color-txt-main, rgba(255,255,255,0.9));
    }

    .btn-ghost:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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

    .form-textarea {
        resize: none;
        font-size: 0.875rem;
        line-height: 1.5;
    }

    .file-list-container {
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(0, 0, 0, 0.2);
        border-radius: 0.75rem;
        max-height: 280px;
        overflow-y: auto;
    }

    .file-list-row {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 0.625rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        cursor: pointer;
        transition: background-color 0.1s ease;
    }

    .file-list-row:hover {
        background: rgba(255, 255, 255, 0.04);
    }

    .file-list-row:last-child {
        border-bottom: none;
    }

    .file-checkbox {
        width: 1rem;
        height: 1rem;
        appearance: none;
        -webkit-appearance: none;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.24);
        border-radius: 0.25rem;
        cursor: pointer;
        display: grid;
        place-content: center;
        transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.2s ease;
    }

    .file-checkbox::before {
        content: "";
        width: 0.6rem;
        height: 0.6rem;
        transform: scale(0) rotate(-8deg);
        transform-origin: center;
        transition: transform 0.15s ease;
        clip-path: polygon(14% 54%, 27% 42%, 44% 59%, 77% 24%, 88% 35%, 45% 78%);
        background: black;
    }

    .file-checkbox:hover {
        border-color: rgba(255, 255, 255, 0.35);
        background: rgba(255, 255, 255, 0.06);
    }

    .file-checkbox:checked::before {
        transform: scale(1) rotate(0deg);
    }

    .file-checkbox:checked {
        background: white;
        border-color: white;
    }

    .file-checkbox:focus-visible {
        outline: none;
    }

    .status-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 9999px;
        flex-shrink: 0;
    }

    .status-modified {
        background: #eab308;
        border-left-color: rgba(234, 179, 8, 0.8);
    }

    .status-untracked {
        background: #10b981;
        border-left-color: rgba(16, 185, 129, 0.8);
    }

    .status-deleted {
        background: #ef4444;
        border-left-color: rgba(239, 68, 68, 0.8);
    }

    .status-unknown {
        background: #94a3b8;
        border-left-color: rgba(148, 163, 184, 0.8);
    }

    .file-path {
        flex: 1;
        min-width: 0;
        font-size: 0.8125rem;
        color: var(--color-txt-main, #fff);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .status-tag {
        font-size: 0.6875rem;
        line-height: 1;
        padding: 0.25rem 0.45rem;
        border-radius: 9999px;
        border: 1px solid transparent;
        letter-spacing: 0.01em;
        white-space: nowrap;
    }

    .status-tag-modified {
        color: #fef08a;
        background: rgba(234, 179, 8, 0.15);
        border-color: rgba(234, 179, 8, 0.35);
    }

    .status-tag-untracked {
        color: #86efac;
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.35);
    }

    .status-tag-deleted {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.35);
    }

    .status-tag-unknown {
        color: #cbd5e1;
        background: rgba(148, 163, 184, 0.15);
        border-color: rgba(148, 163, 184, 0.35);
    }

    .inline-status-message {
        padding: 0.75rem;
        color: var(--color-txt-muted, rgba(255,255,255,0.5));
        font-size: 0.75rem;
        text-align: center;
    }

    .status-message {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.02);
        padding: 0.875rem;
        color: var(--color-txt-muted, rgba(255,255,255,0.5));
        font-size: 0.875rem;
        text-align: center;
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
        color: var(--color-txt-main, rgba(255,255,255,0.9));
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