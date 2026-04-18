<script lang="ts">
	import { mergeModalStore } from './merge-modal-store';

	export let remoteId: string;
	export let isLoading: boolean;
	export let isMerging: boolean;
	export let collaborators: string[];
	export let selectedAuthors: Set<string>;

	function handleToggleAuthor(author: string) {
		mergeModalStore.toggleAuthorSelection(author, remoteId);
	}
</script>

<div class="section-card">
	<div class="section-header">
		<h4 class="section-title">Step 1: Select Authors</h4>
	</div>

	{#if isLoading}
		<div class="section-content">
			<div class="text-txt-muted text-sm">Loading collaborators...</div>
		</div>
	{:else if collaborators.length === 0}
		<div class="section-content">
			<div class="text-txt-muted text-sm">No collaborators found for this remote.</div>
		</div>
	{:else}
		<div class="section-content checkbox-group">
			{#each collaborators as author}
				<label class="checkbox-item">
					<input
						type="checkbox"
						checked={selectedAuthors.has(author)}
						on:change={() => handleToggleAuthor(author)}
						disabled={isMerging}
						class="checkbox-input"
					/>
					<span class="checkbox-label">{author}</span>
				</label>
			{/each}
		</div>
	{/if}
</div>

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

	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 200px;
		overflow-y: auto;
	}

	.checkbox-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.checkbox-item:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.checkbox-input {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
		accent-color: #8b5cf6;
	}

	.checkbox-label {
		font-size: 0.875rem;
		color: var(--color-txt-main, #fff);
		cursor: pointer;
	}

	.text-txt-muted {
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}

	.text-sm {
		font-size: 0.875rem;
	}
</style>
