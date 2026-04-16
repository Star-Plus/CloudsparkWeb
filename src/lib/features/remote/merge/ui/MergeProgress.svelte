<script lang="ts">
	import Icon from '@iconify/svelte';
	import { mergeModalStore } from './merge-modal-store';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	export let selectedAuthors: Set<string>;
	export let selectedCommits: Map<string, string[]>;

	const progress = tweened(0, { duration: 400, easing: cubicOut });

	$: {
		const progressData = mergeModalStore.getProgress();
		progress.set(progressData.percentage);
	}

	$: selectedCommitCount = Array.from(selectedCommits.values()).reduce(
		(sum, commits) => sum + commits.length,
		0
	);

	$: totalFiles = mergeModalStore.getTotalFileCount();

	$: completionState =
		selectedCommitCount === 0
			? 'start'
			: selectedCommitCount < 3
				? 'inProgress'
				: 'ready';

	$: statusMessage =
		completionState === 'start'
			? 'Select commits to begin'
			: completionState === 'inProgress'
				? 'Keep going...'
				: 'Ready to merge';

	$: statusIcon =
		completionState === 'start'
			? 'mdi:play-circle-outline'
			: completionState === 'inProgress'
				? 'mdi:progress-check'
				: 'mdi:check-circle';
</script>

<div class="merge-progress">
	<div class="progress-header">
		<div class="progress-status">
			<Icon icon={statusIcon} width="20" height="20" />
			<span class="status-text">{statusMessage}</span>
		</div>

		{#if selectedCommitCount > 0}
			<div class="progress-stats">
				<div class="stat-item">
					<Icon icon="mdi:source-commit" width="14" height="14" />
					<span>{selectedCommitCount}</span>
				</div>
				{#if totalFiles > 0}
					<div class="stat-item">
						<Icon icon="mdi:file-multiple" width="14" height="14" />
						<span>{totalFiles}</span>
					</div>
				{/if}
				<div class="stat-item">
					<Icon icon="mdi:account-multiple" width="14" height="14" />
					<span>{selectedAuthors.size}</span>
				</div>
			</div>
		{/if}
	</div>

	<div class="progress-bar-container">
		<div class="progress-bar-track">
			<div
				class="progress-bar-fill"
				class:ready={completionState === 'ready'}
				style="width: {$progress}%"
			></div>
		</div>
	</div>

	{#if selectedCommitCount > 0}
		<div class="progress-message">
			{#if completionState === 'ready'}
				<Icon icon="mdi:check-decagram" width="16" height="16" />
				<span>Clean merge • No conflicts detected</span>
			{:else}
				<span>{selectedAuthors.size} author{selectedAuthors.size !== 1 ? 's' : ''} selected</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.merge-progress {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		padding: 1rem 1.25rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.progress-status {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		color: white;
		font-weight: 500;
		font-size: 0.9375rem;
	}

	.progress-stats {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 0.375rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 500;
	}

	.progress-bar-container {
		width: 100%;
	}

	.progress-bar-track {
		width: 100%;
		height: 0.5rem;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 0.25rem;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #ffffff 0%, #525252 100%);
		border-radius: 0.25rem;
		transition: width 0.4s cubic-bezier(0.33, 1, 0.68, 1);
	}

	.progress-bar-fill.ready {
		background: linear-gradient(90deg, #10b981 0%, #059669 100%);
	}

	.progress-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.progress-message :global(svg) {
		color: #6ee7b7;
	}
</style>
