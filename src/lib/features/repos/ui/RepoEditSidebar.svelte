<script lang="ts">
    import type Repository from "../Repository";
    import RepositoryStore from "../RepositoryStore";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import Icon from "@iconify/svelte";

    export let repo: Repository | null = null;
    export let isOpen: boolean = false;
    export let onClose: () => void = () => {};

    let editedName: string = "";
    let editedEmoji: string = "📁";
    let showEmojiPicker: boolean = false;
    let emojiPickerElement: any;

    onMount(async () => {
        await import("emoji-picker-element");
        emojiPickerElement = document.querySelector("emoji-picker");
    });

    $: if (repo) {
        editedName = repo.shortName || "";
        editedEmoji = repo.emoji || "📁";
    }

    function handleSave() {
        if (!repo) return;

        repo.shortName = editedName;
        repo.emoji = editedEmoji;

        const store = RepositoryStore.getInstance();
        store.updateRepository(repo.getId, repo);
        onClose();
    }

    function handleEmojiSelect(event: any) {
        const emoji = event.detail?.unicode || event.target?.value || "";
        if (emoji) {
            editedEmoji = emoji;
            showEmojiPicker = false;
        }
    }

    function handleCancel() {
        onClose();
    }
</script>

{#if isOpen && repo}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div 
        class="sidebar-overlay" 
        on:click={handleCancel} 
        on:keydown={(e) => e.key === 'Escape' && handleCancel()}
        transition:fade={{ duration: 200 }}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <aside 
            class="sidebar" 
            on:click={(e) => e.stopPropagation()}
            transition:fly={{ x: 400, duration: 500, easing: cubicOut }}
        >
            <div class="sidebar-header">
                <h2 class="text-xl font-bold">Edit Repository</h2>
                <button class="close-btn" on:click={handleCancel} title="Close sidebar">
                    <Icon icon="si:x-close" />
                </button>
            </div>

            <div class="sidebar-content">
                <!-- Emoji Picker Section -->
                <div class="form-group">
                    <label for="emoji-select">Repository Emoji</label>
                    <div class="emoji-selector">
                        <button
                            class="emoji-display"
                            on:click={() => (showEmojiPicker = !showEmojiPicker)}
                            title="Click to change emoji"
                        >
                            <span class="text-4xl">{editedEmoji}</span>
                        </button>
                        {#if showEmojiPicker}
                            <div class="emoji-picker-wrapper">
                                <emoji-picker
                                    on:emoji-click={handleEmojiSelect}
                                    on:emoji-select={handleEmojiSelect}
                                ></emoji-picker>
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Repository Name Section -->
                <div class="form-group">
                    <label for="repo-name">Repository Name</label>
                    <input
                        id="repo-name"
                        type="text"
                        placeholder="Enter repository name"
                        bind:value={editedName}
                        class="form-input"
                    />
                </div>

                <!-- Read-only Info -->
                <div class="form-group info-section">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Repository Path</label>
                    <p class="info-text">{repo.path}</p>
                </div>

                <div class="form-group info-section">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Created</label>
                    <p class="info-text">{new Date(repo.createdAt).toLocaleString()}</p>
                </div>

                <div class="form-group info-section">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Last Modified</label>
                    <p class="info-text">{new Date(repo.updatedAt).toLocaleString()}</p>
                </div>
            </div>

            <div class="sidebar-footer">
                <button class="btn-cancel" on:click={handleCancel}>Cancel</button>
                <button class="btn-save" on:click={handleSave}>Save Changes</button>
            </div>
        </aside>
    </div>
{/if}

<style>
    .sidebar-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: flex-end;
        z-index: 1000;
    }

    .sidebar {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 400px;
        height: 100%;
        background: #121212;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
        overflow-y: auto;
    }

    .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: #1c1c1c;
        position: sticky;
        top: 0;
    }

    .sidebar-header h2 {
        color: #fff;
        margin: 0;
    }

    .close-btn {
        background: none;
        border: none;
        color: #aaa;
        cursor: pointer;
        font-size: 24px;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: #fff;
    }

    .sidebar-content {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-group label {
        color: #ccc;
        font-size: 14px;
        font-weight: 500;
    }

    .form-input {
        padding: 10px 12px;
        background: #121212;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        color: #fff;
        font-size: 14px;
        transition: border-color 0.2s;
    }

    .form-input:focus {
        outline: none;
        border-color: var(--color-primary);
        background: #161616;
    }

    .form-input::placeholder {
        color: #666;
    }

    .emoji-selector {
        position: relative;
    }

    .emoji-display {
        width: 100%;
        padding: 12px;
        background: #121212;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .emoji-display:hover {
        border-color: var(--color-primary);
        background: #161616;
    }

    .emoji-display:focus {
        outline: none;
        border-color: var(--color-primary);
    }

    .emoji-picker-wrapper {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        z-index: 1001;
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .info-section {
        background: #1c1c1c;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .info-text {
        color: #999;
        font-size: 13px;
        margin: 0;
        word-break: break-all;
    }

    .sidebar-footer {
        display: flex;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background: #1c1c1c;
    }

    .btn-cancel,
    .btn-save {
        flex: 1;
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-cancel {
        background: #333;
        color: #ccc;
    }

    .btn-cancel:hover {
        background: #444;
        color: #fff;
    }

    .btn-save {
        background: #8838ff;
        color: #fff;
    }

    .btn-save:hover {
        background: #a854ff;
    }

    .btn-save:active {
        transform: scale(0.98);
    }

    /* Emoji picker element styling */
    :global(emoji-picker) {
        --font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif;
        --num-columns: 8;
        --background: #2a2a2a;
        --text-color: #fff;
        --border-color: #444;
        --category-button-background: #333;
        --category-button-active-background: #8838ff;
        --search-background: #333;
        --search-border-color: #555;
    }
</style>
