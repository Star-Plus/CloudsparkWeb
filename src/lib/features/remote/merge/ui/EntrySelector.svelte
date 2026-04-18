<script lang="ts">
	import Icon from '@iconify/svelte';
	import { mergeModalStore } from './merge-modal-store';
	import type AuthorCommitResponse from '$lib/features/remote/commits/dtos/AuthorCommitResponse';

	export let selectedAuthors: Set<string>;
	export let authorCommits: Map<string, AuthorCommitResponse>;
	export let selectedCommits: Map<string, string[]>;
	export let selectedEntries: Map<string, Set<string>>;
	export let isMerging: boolean;
	export let onPreview: (entryHash: string, entryName?: string) => void;

	function handleToggleEntry(commitHash: string, entryName: string) {
		mergeModalStore.toggleEntrySelection(commitHash, entryName);
	}

	function isEntrySelected(commitHash: string, entryName: string): boolean {
		const entries = selectedEntries.get(commitHash) || new Set();
		return entries.has(entryName);
	}

	$: hasSelectedCommits = Array.from(selectedCommits.values()).some((commits) => commits.length > 0);
</script>

{#if hasSelectedCommits}
	<div class="section-card">
		<div class="section-header">
			<h4 class="section-title">Step 3: Select Entries (Optional)</h4>
			<p class="section-description">Leave empty to merge all entries from selected commits</p>
		</div>

		<div class="section-content entry-list">
			{#each Array.from(selectedAuthors) as author}
				{@const selectedCommitsList = selectedCommits.get(author) || []}
				{#if selectedCommitsList.length > 0}
					{#each selectedCommitsList as commitHash}
						{@const commit = authorCommits.get(author)?.commits.find((c) => c.hash === commitHash)}
						{#if commit}
							<div class="entry-group">
								<p class="entry-header">{author} • {commitHash.slice(0, 8)}</p>

								{#if commit.tree.entries && commit.tree.entries.length > 0}
									<div class="entry-items">
										{#each commit.tree.entries as entry}
											<div class="entry-item">
												<label class="entry-checkbox-label">
													<input
														type="checkbox"
														checked={isEntrySelected(commitHash, entry.name)}
														on:change={() => handleToggleEntry(commitHash, entry.name)}
														disabled={isMerging}
														class="checkbox-input"
													/>
													<span class="entry-name">{entry.name}</span>
												</label>
												<button
													type="button"
													class="btn btn-secondary btn-sm"
													on:click={() => onPreview(entry.hash, entry.name)}
													disabled={isMerging}
													title="Preview asset"
												>
													<Icon icon="mdi:eye" width="16" height="16" />
													Preview
												</button>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-xs text-txt-muted">No entries in this commit</p>
								{/if}
							</div>
						{/if}
					{/each}
				{/if}
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

	.section-description {
		font-size: 0.75rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
		margin: 0;
	}

	.section-content {
		padding: 0.75rem;
	}

	.entry-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-height: 250px;
		overflow-y: auto;
	}

	.entry-group {
		border-left: 2px solid rgba(255, 255, 255, 0.15);
		padding-left: 0.75rem;
	}

	.entry-header {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-txt-main, #fff);
		margin-bottom: 0.5rem;
	}

	.entry-items {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.entry-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: 0.375rem;
		background: rgba(255, 255, 255, 0.02);
		transition: background 0.15s ease;
	}

	.entry-item:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.entry-checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		flex: 1;
		min-width: 0;
	}

	.entry-name {
		font-size: 0.8125rem;
		color: var(--color-txt-main, #fff);
		word-break: break-word;
	}

	.checkbox-input {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
		accent-color: #8b5cf6;
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

	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		gap: 0.375rem;
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

	.text-xs {
		font-size: 0.75rem;
	}

	.text-txt-muted {
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}
</style>
