<script lang="ts">
	import Icon from "@iconify/svelte";

	// svelte-ignore export_let_unused
		export let username: string;

	const stats = [
		{ label: "Repositories", value: "---", icon: "material-symbols:folder-outline" },
		{ label: "Collaborations", value: "---", icon: "solar:users-group-rounded-line-duotone" },
		{ label: "Contributions", value: "---", icon: "material-symbols:commit" }
	];
</script>

<section class="stats-grid">
	{#each stats as stat}
		<div class="stat-card">
			<div class="stat-icon">
				<Icon icon={stat.icon} width="24" height="24" />
			</div>
			<div class="stat-content">
				<p class="stat-value">{stat.value}</p>
				<p class="stat-label">{stat.label}</p>
			</div>
		</div>
	{/each}
</section>

<style>
	.stats-grid {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		width: 100%;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.25rem;
	}

	.stat-icon {
		width: 2rem;
		height: 2rem;
		border-radius: 0.375rem;
		background: rgba(255, 255, 255, 0.04);
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.4);
		flex-shrink: 0;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.stat-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.stat-label {
		font-size: 0.7rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.4));
		margin: 0;
	}

	.stat-value {
		font-family: 'Jost', sans-serif;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-txt-main, #fff);
		margin: 0;
		line-height: 1.2;
	}
</style>
