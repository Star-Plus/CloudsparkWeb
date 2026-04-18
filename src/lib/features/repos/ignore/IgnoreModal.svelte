<script lang="ts">
    import IgnoreApi from "./IgnoreApi";
    import { fade, scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    export let repoId: string | null = null;
    export let isOpen = false;
	export let closeTab: () => void;

    let ignorePatterns: string[] = [];
    let newPattern = "";
    let loading = false;
    let saving = false;
    let errorMessage: string | null = null;
    let successMessage: string | null = null;

    $: if (isOpen && repoId) {
        loadIgnorePatterns();
    }

    async function loadIgnorePatterns() {
        if (!repoId) return;

        loading = true;
        errorMessage = null;
        try {
            const content = await IgnoreApi.getIgnoreFileContent(repoId);
            ignorePatterns = content
                .split("\n")
                .map(line => line.trim())
                .filter(line => line && !line.startsWith("#"));
        } catch (error) {
            console.error("Failed to load ignore patterns", error);
            errorMessage = "Failed to load ignore patterns.";
            ignorePatterns = [];
        } finally {
            loading = false;
        }
    }

    async function handleAddPattern() {
        if (!repoId || !newPattern.trim()) return;

        saving = true;
        errorMessage = null;
        successMessage = null;

        try {
            await IgnoreApi.addIgnorePattern(repoId, newPattern.trim());
            successMessage = "Pattern added successfully!";
            newPattern = "";
            await loadIgnorePatterns();
            setTimeout(() => {
                successMessage = null;
            }, 2000);
        } catch (error) {
            console.error("Failed to add pattern", error);
            errorMessage = "Failed to add pattern. Please try again.";
        } finally {
            saving = false;
        }
    }

    async function handleRemovePattern(pattern: string) {
        if (!repoId) return;

        errorMessage = null;
        successMessage = null;

        try {
            await IgnoreApi.removeIgnorePattern(repoId, pattern);
            successMessage = "Pattern removed successfully!";
            await loadIgnorePatterns();
            setTimeout(() => {
                successMessage = null;
            }, 2000);
        } catch (error) {
            console.error("Failed to remove pattern", error);
            errorMessage = "Failed to remove pattern. Please try again.";
        }
    }

    function close() {
        isOpen = false;
        errorMessage = null;
        successMessage = null;
        newPattern = "";
        closeTab();
    }
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
        class="modal-backdrop" 
        on:click={close}
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
				<h3 class="modal-title">Ignore Patterns</h3>
				<button
					type="button"
					class="modal-close"
					on:click={close}
					title="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="modal-description">
				Manage patterns for files that should be ignored in your repository.
			</div>

			{#if errorMessage}
				<div class="error-message">
					<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			{#if successMessage}
				<div class="success-message">
					<svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{successMessage}</span>
				</div>
			{/if}

			<div class="modal-body">
				<!-- Add Pattern Form -->
				<div class="form-section">
					<form class="form-row" on:submit|preventDefault={handleAddPattern}>
						<input
							type="text"
							class="form-input"
							bind:value={newPattern}
							placeholder="e.g. *.log, node_modules/, .env"
							disabled={saving}
						/>
						<button
							type="submit"
							class="btn btn-primary"
							disabled={saving || !newPattern.trim()}
							title="Add pattern"
						>
							{#if saving}
								<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
							{:else}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
							{/if}
							<span>{saving ? "Adding..." : "Add"}</span>
						</button>
					</form>
				</div>

				<!-- Patterns List -->
				<div class="section-card">
					<div class="section-header">
						<h4 class="section-title">Patterns</h4>
					</div>

					<div class="patterns-container">
						{#if loading}
							<div class="empty-state">
								<svg class="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							</div>
						{:else if ignorePatterns.length === 0}
							<div class="empty-state">
								<svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								<p class="text-sm">No ignore patterns configured</p>
								<p class="text-xs opacity-70">Add patterns to ignore files and folders</p>
							</div>
						{:else}
							<ul class="patterns-list">
								{#each ignorePatterns as pattern, index (index)}
									<li class="pattern-item">
										<div class="pattern-content">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<code class="pattern-text">{pattern}</code>
										</div>
										<button
											type="button"
											class="btn-icon-delete"
											on:click={() => handleRemovePattern(pattern)}
											title="Remove pattern"
											disabled={saving}
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="modal-actions">
				<button
					type="button"
					class="btn btn-secondary"
					on:click={close}
				>
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
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 40;
	}

	.modal-content {
		background: #0e0e0e;
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 0.5rem;
		box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.9);
		width: 100%;
		max-width: 600px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.modal-title {
		font-family: 'Jost', sans-serif;
		font-size: 1.125rem;
		font-weight: 700;
		color: white;
		margin: 0;
        letter-spacing: -0.01em;
	}

	.modal-close {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		border: none;
		background: transparent;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.modal-close:hover {
		background: rgba(255, 255, 255, 0.06);
		color: var(--color-txt-main, rgba(255, 255, 255, 0.9));
	}

	.modal-description {
		font-size: 0.875rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
		padding: 0 1.5rem 0.75rem 1.5rem;
	}

	.error-message {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin: 1.5rem;
		padding: 0.875rem 1rem;
		border-radius: 0.5rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
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
		margin: 1.5rem;
		padding: 0.875rem 1rem;
		border-radius: 0.5rem;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.2);
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
		gap: 1.25rem;
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.form-row {
		display: flex;
		gap: 0.75rem;
	}

	.form-input {
		flex: 1;
		padding: 0.625rem 1rem;
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: var(--color-txt-main, #fff);
		font-size: 0.875rem;
		transition: all 0.15s ease;
	}

	.form-input::placeholder {
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.4));
	}

	.form-input:focus {
		outline: none;
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
	}

	.form-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.section-card {
		border: 1px solid rgba(255, 255, 255, 0.04);
		border-radius: 0.5rem;
		background: #121212;
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
		margin: 0;
	}

	.patterns-container {
		max-height: 250px;
		overflow-y: auto;
	}

	.patterns-list {
		display: flex;
		flex-direction: column;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.pattern-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		transition: background 0.15s ease;
	}

	.pattern-item:hover {
		background: rgba(255, 255, 255, 0.04);
	}

	.pattern-item:last-child {
		border-bottom: none;
	}

	.pattern-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.pattern-content svg {
		flex-shrink: 0;
		color: rgba(255, 255, 255, 0.5);
	}

	.pattern-text {
		font-family: monospace;
		font-size: 0.8125rem;
		color: var(--color-txt-main, #fff);
		word-break: break-all;
	}

	.btn-icon-delete {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.375rem;
		border: none;
		background: transparent;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
		cursor: pointer;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.btn-icon-delete:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.12);
		color: #f87171;
	}

	.btn-icon-delete:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 3rem 1rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
	}

	.empty-state svg {
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}

	.empty-state p {
		margin: 0;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
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
</style>
