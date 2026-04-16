<script lang="ts">
	import { mergeModalStore } from './merge-modal-store';
	import type AuthorCommitResponse from '$lib/features/remote/commits/dtos/AuthorCommitResponse';

	export let selectedAuthors: Set<string>;
	export let authorCommits: Map<string, AuthorCommitResponse>;
	export let selectedCommits: Map<string, string[]>;
	export let isMerging: boolean;

	function handleToggleCommit(author: string, commitHash: string) {
		mergeModalStore.toggleCommitSelection(author, commitHash);
	}

	function isCommitSelected(author: string, commitHash: string): boolean {
		const commits = selectedCommits.get(author) || [];
		return commits.includes(commitHash);
	}
</script>

{#if selectedAuthors.size > 0}
	<div class="section-card">
		<div class="section-header">
			<h4 class="section-title">Step 2: Select Commits</h4>
		</div>

		<div class="section-content commit-list">
			{#each Array.from(selectedAuthors) as author}
				<div class="author-group">
					<p class="author-name">{author}</p>

					{#if authorCommits.has(author)}
						{@const commits = authorCommits.get(author)?.commits || []}
						{#if commits.length === 0}
							<p class="text-xs text-txt-muted">No commits available</p>
						{:else}
							<div class="commit-items">
								{#each commits as commit}
									<label class="commit-item">
										<input
											type="checkbox"
											checked={isCommitSelected(author, commit.hash)}
											on:change={() => handleToggleCommit(author, commit.hash)}
											disabled={isMerging}
											class="checkbox-input"
										/>
										<div class="commit-info">
											<div class="commit-hash">{commit.hash.slice(0, 8)}</div>
											<div class="commit-message">{commit.message}</div>
											<div class="commit-date">{new Date(commit.timestamp).toLocaleString()}</div>
										</div>
									</label>
								{/each}
							</div>
						{/if}
					{:else}
						<div class="text-xs text-txt-muted">Loading commits...</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.section-card {
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		overflow: hidden;
	}

	.section-header {
		padding: 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.section-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-txt-main, #fff);
		margin: 0 0 0.5rem 0;
	}

	.section-content {
		padding: 0.75rem;
	}

	.commit-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-height: 250px;
		overflow-y: auto;
	}

	.author-group {
		border-left: 2px solid rgba(255, 255, 255, 0.15);
		padding-left: 0.75rem;
	}

	.author-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-txt-main, #fff);
		margin-bottom: 0.5rem;
	}

	.commit-items {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.commit-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.commit-item:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.commit-info {
		flex: 1;
		min-width: 0;
	}

	.commit-hash {
		font-family: monospace;
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 500;
	}

	.commit-message {
		font-size: 0.8125rem;
		color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
		word-break: break-word;
	}

	.commit-date {
		font-size: 0.75rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}

	.checkbox-input {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
		accent-color: #8b5cf6;
	}

	.text-xs {
		font-size: 0.75rem;
	}

	.text-txt-muted {
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}
</style>
