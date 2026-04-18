<script lang="ts">
	import Icon from '@iconify/svelte';
	import AssetPreview from '$lib/features/assets/preview/ui/AssetPreview.svelte';
	import type { PreviewAsset } from './merge-modal-types';
	import { fade } from 'svelte/transition';

	export let isOpen: boolean;
	export let asset: PreviewAsset | null;
	export let remoteId: string;
	export let onClose: () => void;

	let isLoading = true;
	let hasError = false;

	function handleAssetLoaded() {
		isLoading = false;
		hasError = false;
	}

	function handleAssetError() {
		hasError = true;
		isLoading = false;
	}

	$: if (isOpen && asset) {
		isLoading = true;
		hasError = false;
	}
</script>

{#if isOpen && asset}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop" on:click={onClose} transition:fade={{ duration: 200 }}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="preview-modal" on:click|stopPropagation transition:fade={{ duration: 300 }}>
			<div class="modal-header">
				<div class="header-content">
					<h3 class="modal-title">
						<Icon icon="mdi:file-eye" width="20" height="20" />
						Asset Preview
					</h3>
					<p class="modal-subtitle">{asset.type}</p>
				</div>
				<button
					type="button"
					class="modal-close"
					on:click={onClose}
					disabled={isLoading}
					title="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="preview-content">
				{#if isLoading}
					<div class="loading-state">
						<div class="loader-wrapper">
							<div class="spinner-ring"></div>
							<Icon icon="mdi:layers" class="loader-icon" width="32" height="32" />
						</div>
						<p class="loading-text">Loading asset...</p>
						<span class="loading-subtext">This may take a moment</span>
					</div>
				{:else if hasError}
					<div class="error-state">
						<Icon icon="mdi:alert-circle" width="48" height="48" />
						<p class="error-title">Failed to Load Asset</p>
						<span class="error-text">Unable to preview this asset at this time</span>
					</div>
				{/if}
                
                <div class="asset-preview-wrapper">
                    <AssetPreview
                        {asset}
                        {remoteId}
                        onLoaded={handleAssetLoaded}
                        onError={handleAssetError}
                        on:error={handleAssetError}
                    />
                </div>
			</div>

			<div class="modal-actions">
				<button
					type="button"
					class="btn btn-secondary"
					on:click={onClose}
					disabled={isLoading}
				>
					<Icon icon="mdi:close" width="16" height="16" />
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 51;
		padding: 1rem;
	}

	.preview-modal {
		background: #0e0e0e;
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 0.5rem;
		box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
		width: 100%;
		max-width: 700px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		gap: 1rem;
	}

	.header-content {
		flex: 1;
	}

	.modal-title {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		font-size: 1.125rem;
		font-weight: 700;
		color: white;
		margin: 0 0 0.25rem 0;
		letter-spacing: -0.01em;
        text-transform: uppercase;
	}

	.modal-title :global(svg) {
		color: rgba(255, 255, 255, 0.5);
	}

	.modal-subtitle {
		font-size: 0.8125rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
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

	.preview-content {
		flex: 1;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.06);
		margin: 0 1rem;
		border-radius: 0.625rem;
	}

	.asset-preview-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: auto;
	}

	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 3rem 2rem;
		text-align: center;
	}

	.loader-wrapper {
		position: relative;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.spinner-ring {
		position: absolute;
		width: 80px;
		height: 80px;
		border: 3px solid rgba(255, 255, 255, 0.05);
		border-top-color: white;
		border-right-color: white;
		border-radius: 50%;
		animation: spin 1.2s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse-fade {
		0%,
		100% {
			opacity: 0.6;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.1);
		}
	}

	.loading-text {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
		margin: 0;
		letter-spacing: -0.01em;
	}

	.loading-subtext {
		font-size: 0.8125rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}

	.error-state :global(svg) {
		color: rgba(239, 68, 68, 0.8);
	}

	.error-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
		margin: 0;
		letter-spacing: -0.01em;
	}

	.error-text {
		font-size: 0.8125rem;
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
		padding: 0.625rem 1.25rem;
		border-radius: 0.625rem;
		font-weight: 600;
		font-size: 0.875rem;
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
		transform: translateY(-1px);
	}

	.btn-secondary:active:not(:disabled) {
		transform: translateY(0);
	}

	/* Scrollbar styling */
	.asset-preview-wrapper::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.asset-preview-wrapper::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.02);
		border-radius: 4px;
	}

	.asset-preview-wrapper::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}

	.asset-preview-wrapper::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
