<script lang="ts">
	import Icon from '@iconify/svelte';
	import { mergeModalStore } from './merge-modal-store';
	import type AuthorCommitResponse from '$lib/features/remote/commits/dtos/AuthorCommitResponse';
	import { slide, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let selectedAuthors: Set<string>;
	export let authorCommits: Map<string, AuthorCommitResponse>;
	export let selectedCommits: Map<string, string[]>;
	export let selectedEntries: Map<string, Set<string>>;
	export let isMerging: boolean;
	export let onPreview: (entryHash: string, entryName?: string) => void;

	let expandedCommits = new Set<string>();

	function toggleCommitExpansion(commitHash: string) {
		if (expandedCommits.has(commitHash)) {
			expandedCommits.delete(commitHash);
		} else {
			expandedCommits.add(commitHash);
		}
		expandedCommits = expandedCommits;
	}

	function handleToggleEntry(commitHash: string, entryName: string) {
		mergeModalStore.toggleEntrySelection(commitHash, entryName);
	}

	function isEntrySelected(commitHash: string, entryName: string): boolean {
		const entries = selectedEntries.get(commitHash) || new Set();
		return entries.has(entryName);
	}

	function getFileIcon(fileName: string): string {
		const ext = fileName.split('.').pop()?.toLowerCase();
		const iconMap: Record<string, string> = {
			png: 'mdi:file-image',
			jpg: 'mdi:file-image',
			jpeg: 'mdi:file-image',
			gif: 'mdi:file-image',
			svg: 'mdi:file-image',
			webp: 'mdi:file-image',
			mp4: 'mdi:file-video',
			webm: 'mdi:file-video',
			mp3: 'mdi:file-music',
			wav: 'mdi:file-music',
			json: 'mdi:code-json',
			js: 'mdi:language-javascript',
			ts: 'mdi:language-typescript',
			py: 'mdi:language-python',
			md: 'mdi:language-markdown',
			txt: 'mdi:file-document',
		};
		return iconMap[ext || ''] || 'mdi:file';
	}

	function getFileCategory(fileName: string): string {
		const ext = fileName.split('.').pop()?.toLowerCase();
		if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) return 'Image';
		if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'Video';
		if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'Audio';
		if (['json', 'js', 'ts', 'py', 'css'].includes(ext || '')) return 'Code';
		return 'File';
	}

	$: hasSelectedCommits = Array.from(selectedCommits.values()).some(
		(commits) => commits.length > 0
	);

	$: totalFiles = Array.from(selectedAuthors).reduce((total, author) => {
		const commits = selectedCommits.get(author) || [];
		return (
			total +
			commits.reduce((sum, commitHash) => {
				const commit = authorCommits.get(author)?.commits.find((c) => c.hash === commitHash);
				return sum + (commit?.tree?.entries?.length || 0);
			}, 0)
		);
	}, 0);

	$: selectedFileCount = Array.from(selectedEntries.values()).reduce(
		(sum, entries) => sum + entries.size,
		0
	);
</script>

{#if hasSelectedCommits}
	<div class="asset-inspector" transition:slide={{ duration: 300, easing: quintOut }}>
		<div class="inspector-header">
			<div class="header-content">
				<h3 class="header-title">
					<Icon icon="mdi:layers-triple" width="20" height="20" />
					Inspect Changes
				</h3>
				<p class="header-subtitle">
					{#if selectedFileCount > 0}
						{selectedFileCount} of {totalFiles} file{totalFiles !== 1 ? 's' : ''} selected
					{:else}
						All {totalFiles} file{totalFiles !== 1 ? 's' : ''} will be merged
					{/if}
				</p>
			</div>
			<div class="info-badge">
				<Icon icon="mdi:information" width="14" height="14" />
				<span>Optional refinement</span>
			</div>
		</div>

		<div class="commits-grid">
			{#each Array.from(selectedAuthors) as author}
				{@const selectedCommitsList = selectedCommits.get(author) || []}
				{@const authorColor = mergeModalStore.getAuthorColor(author)}
				{#if selectedCommitsList.length > 0}
					{#each selectedCommitsList as commitHash}
						{@const commit = authorCommits
							.get(author)
							?.commits.find((c) => c.hash === commitHash)}
						{#if commit && commit.tree.entries && commit.tree.entries.length > 0}
							{@const isExpanded = expandedCommits.has(commitHash)}
							{@const commitEntries = selectedEntries.get(commitHash) || new Set()}

							<div
								class="commit-inspector-card"
								class:expanded={isExpanded}
								style="--commit-color: {authorColor}"
							>
								<button
									class="commit-inspector-header"
									on:click={() => toggleCommitExpansion(commitHash)}
									disabled={isMerging}
									type="button"
								>
									<div class="commit-info">
										<div class="commit-badge">
											<Icon icon="mdi:source-commit" width="14" height="14" />
											{commitHash.slice(0, 7)}
										</div>
										<div class="commit-message-short">{commit.message}</div>
									</div>

									<div class="commit-actions">
										<div class="file-count-badge">
											{commit.tree.entries.length} file{commit.tree.entries.length !== 1
												? 's'
												: ''}
										</div>
										<Icon
											icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
											width="18"
											height="18"
										/>
									</div>
								</button>

								{#if isExpanded}
									<div
										class="assets-grid"
										transition:slide={{ duration: 300, easing: quintOut }}
									>
										{#each commit.tree.entries as entry}
											{@const isSelected = isEntrySelected(commitHash, entry.name)}
											{@const category = getFileCategory(entry.name)}
											{@const icon = getFileIcon(entry.name)}

											<div class="asset-card" class:selected={isSelected}>
												<button
													class="asset-select"
													on:click={() => handleToggleEntry(commitHash, entry.name)}
													disabled={isMerging}
													type="button"
													title={isSelected ? 'Deselect file' : 'Select file'}
												>
													<div class="asset-checkbox">
														{#if isSelected}
															<Icon icon="mdi:check" width="12" height="12" />
														{/if}
													</div>
												</button>

												<div class="asset-content">
													<div class="asset-icon">
														<Icon {icon} width="24" height="24" />
													</div>
													<div class="asset-info">
														<div class="asset-name" title={entry.name}>{entry.name}</div>
														<div class="asset-category">{category}</div>
													</div>
												</div>

												<button
													class="asset-preview-btn"
													on:click={() => onPreview(entry.hash, entry.name)}
													disabled={isMerging}
													type="button"
													title="Preview asset"
												>
													<Icon icon="mdi:eye" width="16" height="16" />
												</button>
											</div>
										{/each}
									</div>
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
	.asset-inspector {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.06);
	}

	.inspector-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.header-content {
		flex: 1;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-txt-main, #fff);
		margin: 0 0 0.375rem 0;
	}

	.header-subtitle {
		font-size: 0.8125rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
		margin: 0;
	}

	.info-badge {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.375rem;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.commits-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.commit-inspector-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.625rem;
		overflow: hidden;
		transition: border-color 0.2s ease;
	}

	.commit-inspector-card.expanded {
		border-color: var(--commit-color);
	}

	.commit-inspector-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 0.15s ease;
		color: inherit;
	}

	.commit-inspector-header:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.03);
	}

	.commit-inspector-header:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.commit-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.commit-badge {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.5rem;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-family: 'SF Mono', 'Monaco', monospace;
		color: rgba(255, 255, 255, 0.6);
		flex-shrink: 0;
	}

	.commit-message-short {
		font-size: 0.8125rem;
		color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.commit-actions {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.file-count-badge {
		font-size: 0.75rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
		padding: 0.25rem 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 0.375rem;
	}

	.assets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.625rem;
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.2);
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	.asset-card {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.5rem;
		transition: all 0.15s ease;
	}

	.asset-card:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.15);
	}

	.asset-card.selected {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.asset-select {
		flex-shrink: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.asset-select:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.asset-checkbox {
		width: 1.125rem;
		height: 1.125rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
		color: white;
	}

	.asset-card.selected .asset-checkbox {
		background: white;
		border-color: white;
		color: black;
	}

	.asset-content {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.asset-icon {
		color: rgba(255, 255, 255, 0.6);
		flex-shrink: 0;
	}

	.asset-info {
		flex: 1;
		min-width: 0;
	}

	.asset-name {
		font-size: 0.8125rem;
		color: var(--color-txt-main, rgba(255, 255, 255, 0.95));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.3;
	}

	.asset-category {
		font-size: 0.6875rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.45));
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.asset-preview-btn {
		flex-shrink: 0;
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: none;
		border-radius: 0.375rem;
		color: rgba(255, 255, 255, 0.6);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.asset-preview-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
	}

	.asset-preview-btn:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}
</style>
