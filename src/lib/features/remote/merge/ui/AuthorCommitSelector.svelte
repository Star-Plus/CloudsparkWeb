<script lang="ts">
	import Icon from '@iconify/svelte';
	import { mergeModalStore } from './merge-modal-store';
	import type AuthorCommitResponse from '$lib/features/remote/commits/dtos/AuthorCommitResponse';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let remoteId: string;
	export let collaborators: string[];
	export let selectedAuthors: Set<string>;
	export let authorCommits: Map<string, AuthorCommitResponse>;
	export let selectedCommits: Map<string, string[]>;
	export let isMerging: boolean;

	let expandedAuthors = new Set<string>();

	function toggleAuthor(author: string) {
		if (expandedAuthors.has(author)) {
			expandedAuthors.delete(author);
		} else {
			expandedAuthors.add(author);
			if (!selectedAuthors.has(author)) {
				mergeModalStore.toggleAuthorSelection(author, remoteId);
			}
		}
		expandedAuthors = expandedAuthors;
	}

	function toggleCommit(author: string, commitHash: string, event: Event) {
		event.stopPropagation();
		mergeModalStore.toggleCommitSelection(author, commitHash);
	}

	function isCommitSelected(author: string, commitHash: string): boolean {
		const commits = selectedCommits.get(author) || [];
		return commits.includes(commitHash);
	}

	function getRelativeTime(timestamp: number): string {
		const now = Date.now();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		return new Date(timestamp).toLocaleDateString();
	}

	function getFileCount(commit: any): number {
		return commit.tree?.entries?.length || 0;
	}

	$: authorColors = new Map(
		collaborators.map((author, index) => [author, mergeModalStore.getAuthorColor(author)])
	);

	$: selectedCommitCount = Array.from(selectedCommits.values()).reduce(
		(sum, commits) => sum + commits.length,
		0
	);
</script>

<div class="author-commit-selector">
	<div class="selector-header">
		<div class="header-content">
			<h3 class="header-title">Select Changes to Merge</h3>
			<p class="header-subtitle">
				Choose commits from collaborators to include in this merge
			</p>
		</div>
		{#if selectedCommitCount > 0}
			<div class="selection-badge" transition:slide={{ duration: 200, easing: quintOut }}>
				<Icon icon="mdi:check-circle" width="16" height="16" />
				<span>{selectedCommitCount} commit{selectedCommitCount !== 1 ? 's' : ''} ready</span>
			</div>
		{/if}
	</div>

	<div class="authors-grid">
		{#each collaborators as author, index}
			{@const authorColor = authorColors.get(author) || 'rgba(255, 255, 255, 0.4)'}
			{@const initials = mergeModalStore.getAuthorInitials(author)}
			{@const isExpanded = expandedAuthors.has(author)}
			{@const isSelected = selectedAuthors.has(author)}
			{@const commits = authorCommits.get(author)?.commits || []}
			{@const selectedCount = (selectedCommits.get(author) || []).length}
			{@const hasCommits = commits.length > 0}

			<div
				class="author-card"
				class:expanded={isExpanded}
				class:selected={isSelected && selectedCount > 0}
				style="--author-color: {authorColor}"
			>
				<button
					class="author-card-header"
					on:click={() => toggleAuthor(author)}
					disabled={isMerging}
					type="button"
				>
					<div class="author-identity">
						<div class="author-avatar" style="background: {authorColor}">
							{initials}
						</div>
						<div class="author-info">
							<div class="author-name">{author}</div>
							{#if hasCommits}
								<div class="author-meta">
									{commits.length} commit{commits.length !== 1 ? 's' : ''} available
								</div>
							{:else if isSelected && !authorCommits.has(author)}
								<div class="author-meta loading">Loading commits...</div>
							{:else}
								<div class="author-meta empty">No commits</div>
							{/if}
						</div>
					</div>

					<div class="author-card-actions">
						{#if selectedCount > 0}
							<div class="selected-indicator">
								<Icon icon="mdi:check-circle" width="18" height="18" />
								<span>{selectedCount}</span>
							</div>
						{/if}
						<Icon
							icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
							width="20"
							height="20"
							class="expand-icon"
						/>
					</div>
				</button>

				{#if isExpanded && hasCommits}
					<div class="commits-container" transition:slide={{ duration: 300, easing: quintOut }}>
						<div class="commits-list">
							{#each commits as commit}
								{@const isSelected = isCommitSelected(author, commit.hash)}
								{@const fileCount = getFileCount(commit)}

								<button
									class="commit-card"
									class:selected={isSelected}
									on:click={(e) => toggleCommit(author, commit.hash, e)}
									disabled={isMerging}
									type="button"
								>
									<div class="commit-selection-indicator">
										{#if isSelected}
											<div class="selected-checkmark">
												<Icon icon="mdi:check" width="14" height="14" />
											</div>
										{:else}
											<div class="unselected-circle"></div>
										{/if}
									</div>

									<div class="commit-content">
										<div class="commit-header">
											<div class="commit-message">{commit.message}</div>
											<div class="commit-time">{getRelativeTime(parseInt(commit.timestamp))}</div>
										</div>

										<div class="commit-meta">
											<div class="commit-hash">
												<Icon icon="mdi:source-commit" width="14" height="14" />
												{commit.hash.slice(0, 7)}
											</div>
											<div class="commit-files">
												<Icon icon="mdi:file-multiple" width="14" height="14" />
												{fileCount} file{fileCount !== 1 ? 's' : ''}
											</div>
										</div>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.author-commit-selector {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.selector-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding: 0.5rem 0;
	}

	.header-content {
		flex: 1;
	}

	.header-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-txt-main, #fff);
		margin: 0 0 0.25rem 0;
	}

	.header-subtitle {
		font-size: 0.875rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
		margin: 0;
	}

	.selection-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 2rem;
		color: #6ee7b7;
		font-size: 0.8125rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.authors-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.author-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.75rem;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.author-card.selected {
		border-color: var(--author-color);
		background: linear-gradient(
			135deg,
			rgba(var(--author-color-rgb), 0.05) 0%,
			rgba(255, 255, 255, 0.02) 100%
		);
		box-shadow: 0 0 0 1px var(--author-color);
	}

	.author-card.expanded {
		border-color: rgba(255, 255, 255, 0.15);
	}

	.author-card-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 0.15s ease;
		color: inherit;
	}

	.author-card-header:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.03);
	}

	.author-card-header:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.author-identity {
		display: flex;
		align-items: center;
		gap: 0.875rem;
	}

	.author-avatar {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.875rem;
		color: white;
		flex-shrink: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.author-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		text-align: left;
	}

	.author-name {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-txt-main, #fff);
	}

	.author-meta {
		font-size: 0.8125rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}

	.author-meta.loading {
		color: rgba(255, 255, 255, 0.4);
	}

	.author-meta.empty {
		color: rgba(255, 255, 255, 0.3);
	}

	.author-card-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.selected-indicator {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		background: var(--author-color);
		border-radius: 1rem;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.commits-container {
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(0, 0, 0, 0.2);
	}

	.commits-list {
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		gap: 0.5rem;
	}

	.commit-card {
		width: 100%;
		display: flex;
		align-items: flex-start;
		gap: 0.875rem;
		padding: 0.875rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.15s ease;
		text-align: left;
		color: inherit;
	}

	.commit-card:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.12);
		transform: translateX(2px);
	}

	.commit-card.selected {
		background: rgba(var(--author-color-rgb), 0.08);
		border-color: var(--author-color);
	}

	.commit-card:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.commit-selection-indicator {
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.selected-checkmark {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 0.25rem;
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		color: black;
	}

	.unselected-circle {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 0.25rem;
		border: 2px solid rgba(255, 255, 255, 0.2);
		transition: border-color 0.15s ease;
	}

	.commit-card:hover .unselected-circle {
		border-color: rgba(255, 255, 255, 0.4);
	}

	.commit-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.commit-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.commit-message {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-txt-main, rgba(255, 255, 255, 0.95));
		line-height: 1.4;
		word-break: break-word;
	}

	.commit-time {
		flex-shrink: 0;
		font-size: 0.75rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.45));
		font-weight: 400;
	}

	.commit-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.75rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}

	.commit-hash,
	.commit-files {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.commit-hash {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
		font-weight: 500;
	}
</style>
