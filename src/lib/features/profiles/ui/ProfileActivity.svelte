<script lang="ts">
	import Icon from "@iconify/svelte";
	// svelte-ignore export_let_unused
	export let username: string;

	// Placeholder data - will be replaced with real data later
	const activities = [
		{ 
			type: "commit", 
			message: "Initial commit for new feature", 
			repo: "cloud-spark", 
			time: "2 hours ago" 
		},
		{ 
			type: "collaboration", 
			message: "Started collaborating on project-x", 
			repo: "project-x", 
			time: "1 day ago" 
		},
		{ 
			type: "repo", 
			message: "Created new repository", 
			repo: "awesome-app", 
			time: "3 days ago" 
		}
	];

	function getActivityIcon(type: string): string {
		switch (type) {
			case "commit": return "material-symbols:commit";
			case "collaboration": return "solar:users-group-rounded-line-duotone";
			case "repo": return "material-symbols:folder-outline";
			default: return "material-symbols:info-outline";
		}
	}
</script>

<section class="activity-section">
	<div class="section-header">
		<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
		</svg>
		<h2 class="section-title">Recent Activity</h2>
	</div>

	<div class="activity-list">
		{#each activities as activity}
			<div class="activity-item">
				<div class="activity-icon">
					<Icon icon={getActivityIcon(activity.type)} width="18" height="18" />
				</div>
				<div class="activity-content">
					<p class="activity-message">{activity.message}</p>
					<div class="activity-meta">
						<span class="activity-repo">{activity.repo}</span>
						<span class="meta-separator">•</span>
						<span class="activity-time">{activity.time}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.activity-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.section-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: rgba(255, 255, 255, 0.4);
		flex-shrink: 0;
	}

	.section-title {
		font-family: 'Jost', sans-serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: white;
		margin: 0;
		letter-spacing: -0.01em;
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.activity-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-radius: 0.75rem;
		background: #1c1c1c;
		border: 1px solid rgba(255, 255, 255, 0.08);
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.activity-item:hover {
		background: #252525;
		border-color: rgba(255, 255, 255, 0.12);
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
	}

	.activity-icon {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.04);
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.5);
		flex-shrink: 0;
	}

	.activity-content {
		flex: 1;
		min-width: 0;
	}

	.activity-message {
		font-size: 0.875rem;
		color: var(--color-txt-main, #fff);
		margin: 0;
	}

	.activity-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.activity-repo {
		font-size: 0.75rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.5));
	}

	.meta-separator {
		font-size: 0.75rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.3));
	}

	.activity-time {
		font-size: 0.75rem;
		color: var(--color-txt-muted, rgba(255, 255, 255, 0.4));
	}
</style>
