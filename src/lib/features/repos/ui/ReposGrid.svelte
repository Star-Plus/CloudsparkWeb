<script lang="ts">
    import { onMount } from "svelte";
    import type Repository from "../Repository";
    import RepositoryStore, { repositories } from "../RepositoryStore";
    import InitializeRepoButton from "../init/InitializeRepoButton.svelte";
    import RepoEditSidebar from "./RepoEditSidebar.svelte";
    import RepoCard from "./RepoCard.svelte";
    import Icon from "@iconify/svelte";
    import FsInfo from "$lib/utils/fs/FsInfo";
    import OpenRepoButton from "../init/OpenRepoButton.svelte";


    let selectedRepo: Repository | null = null;
    let sidebarOpen: boolean = false;
    let viewMode: 'grid' | 'list' = 'grid';
    
    onMount(() => {
        RepositoryStore.getInstance()
    });

    function openEditSidebar(repo: Repository) {
        selectedRepo = repo;
        sidebarOpen = true;
    }

    function closeSidebar() {
        sidebarOpen = false;
        selectedRepo = null;
    }

    async function handleRepoRefresh(repo: Repository) {
        const newSize = await FsInfo.getDirectorySizeInBytes(repo.path);
        repo.storageUsedInBytes = newSize;
        const store = RepositoryStore.getInstance();
        store.shadowUpdateRepository(repo.getId, repo);
    }

</script>


<section>

    <div class="toolbar">
        <div class="toolbar-left">
            <h2 class="section-title">Repositories</h2>
            <span class="count-badge">{$repositories.length}</span>
        </div>
        <div class="toolbar-right">
            <div class="view-toggle">
                <button
                    class="view-btn {viewMode === 'grid' ? 'active' : ''}"
                    on:click={() => viewMode = 'grid'}
                    title="Grid view"
                >
                    <Icon icon="material-symbols:grid-view-outline-rounded" />
                </button>
                <button
                    class="view-btn {viewMode === 'list' ? 'active' : ''}"
                    on:click={() => viewMode = 'list'}
                    title="List view"
                >
                    <Icon icon="material-symbols:view-list-outline" />
                </button>
            </div>
            <div class="action-buttons">
                <OpenRepoButton />
                <InitializeRepoButton />
            </div>
        </div>
    </div>

    {#if $repositories.length === 0}
        <div class="empty-state">
            <div class="empty-icon-wrapper">
                <div class="icon-glow"></div>
                <div class="empty-icon"><Icon icon="mdi:folder-open-outline" class="size-full" /></div>
            </div>
            <p class="empty-text">No repositories yet</p>
            <p class="empty-hint">Create or open a repository to get started</p>
            <div class="mt-8 flex gap-3">
                <OpenRepoButton />
                <InitializeRepoButton />
            </div>
        </div>
    {/if}

    <div class="repos-container {viewMode === 'grid' ? 'grid-view' : 'list-view'}">
        {#each $repositories as repo}
            <RepoCard
                {repo}
                onEdit={openEditSidebar}
                onRefresh={handleRepoRefresh}
            />
        {/each}
    </div>

</section>

<RepoEditSidebar repo={selectedRepo} isOpen={sidebarOpen} onClose={closeSidebar} />

<style>
    .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        margin-bottom: 2rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .toolbar-left {
        display: flex;
        align-items: baseline;
        gap: 0.75rem;
    }

    .section-title {
        font-family: 'Jost', sans-serif;
        font-size: 1.125rem;
        font-weight: 700;
        color: white;
        letter-spacing: -0.01em;
    }

    .count-badge {
        font-size: 0.8125rem;
        color: rgba(255, 255, 255, 0.4);
        padding: 0.125rem 0.5rem;
        background: #1c1c1c;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 0.25rem;
        font-weight: 600;
    }

    .toolbar-right {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .view-toggle {
        display: flex;
        border-radius: 0.5rem;
        border: 1px solid rgba(255,255,255,0.1);
        overflow: hidden;
    }

    .view-btn {
        width: 2.5rem;
        height: 2.5rem;
        display: grid;
        place-items: center;
        font-size: 1.125rem;
        color: var(--color-txt-muted, rgba(255,255,255,0.5));
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .view-btn:hover {
        background: rgba(255,255,255,0.06);
        color: var(--color-txt-main, rgba(255,255,255,0.9));
    }

    .view-btn.active {
        background: rgba(255,255,255,0.08);
        color: var(--color-txt-main, rgba(255,255,255,0.9));
    }

    .action-buttons {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8rem 2rem;
        text-align: center;
    }

    .empty-icon-wrapper {
        position: relative;
        margin-bottom: 2rem;
    }

    .icon-glow {
        position: absolute;
        inset: -20px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
        border-radius: 50%;
        animation: pulseGlow 4s ease-in-out infinite;
    }

    .empty-icon {
        font-size: 5rem;
        color: rgba(255, 255, 255, 0.1);
        position: relative;
        z-index: 1;
        animation: float 6s ease-in-out infinite;
    }

    @keyframes pulseGlow {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.3); opacity: 0.8; }
    }

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
    }

    .empty-text {
        font-size: 1.5rem;
        font-weight: 600;
        color: white;
        margin-bottom: 0.75rem;
        letter-spacing: -0.02em;
    }

    .empty-hint {
        font-size: 1rem;
        color: var(--color-txt-muted, rgba(255,255,255,0.5));
    }

    .repos-container.grid-view {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
        gap: 1.5rem;
    }

    .repos-container.list-view {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
</style>