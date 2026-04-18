<script lang="ts">
	import type MergeResponse from '../dtos/MergeResponse';

	export let mergeResponse: MergeResponse;
</script>

<div class="section-card result-card">
	<div class="section-header">
		<h4 class="section-title result-title">Merge Result</h4>
	</div>
	<div class="result-content">
		<div class="result-item">
			<span class="result-label">Merged Assets:</span>
			<span class="result-value">{mergeResponse.assetUrls.length}</span>
		</div>
		<div class="result-item">
			<span class="result-label">Tree Hash:</span>
			<span class="result-value font-mono">{mergeResponse.tree.hash.slice(0, 8)}</span>
		</div>
		<div class="result-item">
			<span class="result-label">Commit Hash:</span>
			<span class="result-value font-mono">{mergeResponse.commit.hash.slice(0, 8)}</span>
		</div>
	</div>
</div>

<style>
	.section-card {
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		overflow: hidden;
	}

	.result-card {
		background: rgba(34, 197, 94, 0.08);
		border-color: rgba(34, 197, 94, 0.2);
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

	.result-title {
		color: #86efac;
	}

	.result-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
	}

	.result-item {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
		padding: 0.5rem 0;
	}

	.result-label {
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.6));
	}

	.result-value {
		color: var(--color-txt-main, #fff);
		font-weight: 500;
	}

	.font-mono {
		font-family: monospace;
	}
</style>
