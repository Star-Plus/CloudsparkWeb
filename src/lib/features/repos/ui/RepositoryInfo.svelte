<script lang="ts">

    import { page } from "$app/stores";
    import type Repository from "$lib/features/repos/Repository";
    import RepositoryStore from "$lib/features/repos/RepositoryStore";
    import SizeFormatter from "$lib/utils/formaters/SizeFormatter";
    import { onMount } from "svelte";
    import Icon from "@iconify/svelte";

    let repoId = $page.params.repoId;

    let repo: Repository | null = $state(null);
    let pathCopied = $state(false);

    onMount(async () => {

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
    })

    async function copyPath() {
        if (!repo) return;
        try {
            await navigator.clipboard.writeText(repo.path);
            pathCopied = true;
            setTimeout(() => pathCopied = false, 2000);
        } catch (error) {
            console.error("Failed to copy path:", error);
        }
    }

</script>

<div class="repo-info-sidebar">
    {#if repo}
        <!-- Primary: Repository Name -->
        <div class="identity-section">
            <div class="emoji-circle">{repo.emoji || "📁"}</div>
            <h1 class="repo-name">{repo.shortName || repo.getId}</h1>
        </div>

        <!-- Secondary: Metadata in compact row -->
        <div class="metadata">
            {#if repo.remoteId}
                <div class="meta-item remote-indicator" title="Linked to remote">
                    <Icon icon="mdi:cloud-check" class="meta-icon" />
                    <span>Remote linked</span>
                </div>
            {/if}
            <div class="meta-item" title={`Created ${new Date(repo.createdAt).toLocaleString()}`}>
                <Icon icon="mdi:calendar-clock" class="meta-icon" />
                <span>{new Date(repo.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="meta-item" title={`Last updated ${new Date(repo.updatedAt).toLocaleString()}`}>
                <Icon icon="mdi:update" class="meta-icon" />
                <span>{new Date(repo.updatedAt).toLocaleDateString()}</span>
            </div>
            <div class="meta-item" title="Storage usage">
                <Icon icon="mdi:database-outline" class="meta-icon" />
                <span>
                    {#if repo.storageUsedInBytes !== null}
                        {SizeFormatter.formatBytes(repo.storageUsedInBytes)}
                    {:else}
                        Calculating...
                    {/if}
                </span>
            </div>
        </div>

        <div class="path-section">
            <span class="path-label">Local Path</span>
            <!-- svelte-ignore event_directive_deprecated -->
            <button 
                class="path-button" 
                on:click={copyPath}
                title={pathCopied ? "Copied!" : "Click to copy path"}
            >
                <Icon icon="mdi:folder-outline" class="meta-icon" />
                <span class="path-text">{repo.path}</span>
                <Icon icon={pathCopied ? "mdi:check" : "mdi:content-copy"} class="copy-icon" />
            </button>
        </div>
    {:else}
        <p class="text-red-500">Repository not found.</p>
    {/if}
</div>

<style>
	.repo-info-sidebar {
		padding: 2.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		font-family: 'Jost', sans-serif;
	}

	.identity-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1.25rem;
	}

	.emoji-circle {
		width: 4rem;
		height: 4rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
	}

	.repo-name {
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
		letter-spacing: -0.01em;
		line-height: 1.2;
		word-break: break-word;
	}

	.metadata {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.5rem 0;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.5);
	}


	.remote-indicator {
		color: rgba(255, 255, 255, 0.8);
		font-weight: 600;
	}

	.path-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.path-label {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.3);
	}

	.path-button {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.5rem;
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.75rem;
		transition: all 0.2s ease;
		width: 100%;
		text-align: left;
	}

	.path-button:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.15);
		color: white;
	}

	.path-text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: 'Hanken Grotesk', sans-serif;
	}

</style>