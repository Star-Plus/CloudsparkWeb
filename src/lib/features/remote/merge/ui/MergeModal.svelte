<script lang="ts">
	import Icon from "@iconify/svelte";
	import { mergeModalStore } from "./merge-modal-store";
	import MergeService from "../MergeService";
	import MergeRequest from "../dtos/MergeRequest";
	import AuthorCommitSelector from "./AuthorCommitSelector.svelte";
	import AssetInspector from "./AssetInspector.svelte";
	import MergeResult from "./MergeResult.svelte";
	import AssetPreviewModal from "./AssetPreviewModal.svelte";
	import MergeProgress from "./MergeProgress.svelte";
    import { onMount } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

	export let remoteId: string | null = null;
	export let repoPath: string;
	export let closeTab: () => void;

	let state = mergeModalStore;

	$: if (remoteId && $state.collaborators.length === 0) {
		state.loadCollaborators(remoteId);
	}

	$: canMerge = $state.selectedAuthors.size > 0 && 
		Array.from($state.selectedCommits.values()).some((commits) => commits.length > 0);

	async function handleMerge() {
		if ($state.selectedAuthors.size === 0) {
			state.setErrorMessage("Please select at least one author.");
			return;
		}

		let hasAnySelection = false;
		for (const commits of $state.selectedCommits.values()) {
			if (commits.length > 0) {
				hasAnySelection = true;
				break;
			}
		}

		if (!hasAnySelection) {
			state.setErrorMessage("Please select at least one commit.");
			return;
		}

		state.setIsMerging(true);
		state.setErrorMessage(null);
		state.setSuccessMessage(null);

		try {
			const authors = Array.from($state.selectedAuthors).map((author) => {
				const commits = $state.selectedCommits.get(author) || [];
				const versions = commits.map((commitHash) => {
					const entries = $state.selectedEntries.get(commitHash) || new Set();
					return {
						commitHash,
						entries: Array.from(entries),
					};
				});

				return {
					author,
					versions,
				};
			});

			const mergeRequest = new MergeRequest({ authors });

			await MergeService.merge(mergeRequest, remoteId!, repoPath);

			setTimeout(() => {
				closeModal();
			}, 500);
		} catch (error) {
			console.error("Failed to merge", error);
			state.setErrorMessage("Failed to complete merge. Please try again.");
		} finally {
			state.setIsMerging(false);
		}
	}

	function closeModal() {
		state.reset();
		closeTab();
	}

	function handlePreview(entryHash: string, entryName?: string) {
		state.openPreview(entryHash, entryName);
	}

	onMount(()=> {
	})
</script>

{#if remoteId}
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
				<div class="header-content">
					<h2 class="modal-title">Merge Changes</h2>
					<p class="modal-subtitle">Combine work from multiple collaborators</p>
				</div>
				<button
					type="button"
					class="modal-close"
					on:click={closeModal}
					disabled={$state.isMerging}
					title="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{#if $state.errorMessage}
				<div class="error-message">
					<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{$state.errorMessage}</span>
				</div>
			{/if}

			{#if $state.successMessage}
				<div class="success-message">
					<svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{$state.successMessage}</span>
				</div>
			{/if}

			<div class="modal-body">
				{#if $state.collaborators.length > 0}
					<MergeProgress
						selectedAuthors={$state.selectedAuthors}
						selectedCommits={$state.selectedCommits}
					/>
				{/if}

				{#if $state.isLoading}
					<div class="loading-state">
						<Icon icon="mdi:loading" class="animate-spin" width="32" height="32" />
						<p>Loading collaborators...</p>
					</div>
				{:else if $state.collaborators.length === 0}
					<div class="empty-state">
						<Icon icon="mdi:account-group" width="48" height="48" />
						<p>No collaborators found</p>
						<span>Invite team members to start collaborating</span>
					</div>
				{:else}
					<AuthorCommitSelector
						remoteId={remoteId!}
						collaborators={$state.collaborators}
						selectedAuthors={$state.selectedAuthors}
						authorCommits={$state.authorCommits}
						selectedCommits={$state.selectedCommits}
						isMerging={$state.isMerging}
					/>

					<AssetInspector
						selectedAuthors={$state.selectedAuthors}
						authorCommits={$state.authorCommits}
						selectedCommits={$state.selectedCommits}
						selectedEntries={$state.selectedEntries}
						isMerging={$state.isMerging}
						onPreview={handlePreview}
					/>
				{/if}

				{#if $state.mergeResponse}
					<MergeResult mergeResponse={$state.mergeResponse} />
				{/if}
			</div>

			<!-- Action Buttons -->
			<div class="modal-actions">
				<button
					type="button"
					class="btn btn-secondary"
					on:click={closeModal}
					disabled={$state.isMerging}
				>
					Cancel
				</button>
				<button
					type="button"
					class="btn btn-primary"
					disabled={$state.isMerging || !canMerge}
					on:click={handleMerge}
				>
					{#if $state.isMerging}
						<Icon icon="mdi:loading" class="animate-spin" width="16" height="16" />
						Merging...
					{:else}
						<Icon icon="mdi:source-merge" width="16" height="16" />
						Complete Merge
					{/if}
				</button>
			</div>
		</div>
	</div>

	<AssetPreviewModal
		isOpen={$state.showPreview}
		asset={$state.previewAsset}
		remoteId={remoteId!}
		onClose={() => { state.closePreview(); }}
	/>
{/if}

<style>
	.modal-backdrop {
		position: absolute;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		padding: 1rem;
	}

	.modal-content {
		background: #0e0e0e;
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 0.5rem;
		box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.header-content {
		flex: 1;
	}

	.modal-title {
		font-family: 'Jost', sans-serif;
		font-size: 1.125rem;
		font-weight: 700;
		color: white;
		margin: 0 0 0.25rem 0;
		letter-spacing: -0.01em;
	}

	.modal-subtitle {
		font-size: 0.9375rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
		margin: 0;
	}

	.modal-close {
		width: 2.25rem;
		height: 2.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		border: none;
		background: rgba(255, 255, 255, 0.04);
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
		cursor: pointer;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.modal-close:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.08);
		color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
	}

	.modal-close:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error-message {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin: 1.5rem 2rem 0 2rem;
		padding: 1rem 1.125rem;
		border-radius: 0.625rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.25);
		color: #fca5a5;
		font-size: 0.875rem;
	}

	.error-icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.success-message {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin: 1.5rem 2rem 0 2rem;
		padding: 1rem 1.125rem;
		border-radius: 0.625rem;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.25);
		color: #86efac;
		font-size: 0.875rem;
	}

	.success-icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.modal-body {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem;
		overflow-y: auto;
		flex: 1;
	}

	.loading-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 3rem 2rem;
		text-align: center;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}

	.loading-state :global(svg),
	.empty-state :global(svg) {
		color: rgba(255, 255, 255, 0.1);
	}

	.empty-state p {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-txt-main, rgba(255, 255, 255, 0.8));
		margin: 0;
	}

	.empty-state span {
		font-size: 0.875rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.875rem;
		padding: 1.5rem 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 0.625rem;
		font-weight: 600;
		font-size: 0.9375rem;
		transition: all 0.2s ease;
		border: none;
		user-select: none;
		cursor: pointer;
		letter-spacing: -0.01em;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.btn-secondary:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
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

	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* Scrollbar styling */
	.modal-body::-webkit-scrollbar {
		width: 8px;
	}

	.modal-body::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.02);
		border-radius: 4px;
	}

	.modal-body::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}

	.modal-body::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
