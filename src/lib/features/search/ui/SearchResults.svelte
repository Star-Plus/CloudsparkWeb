<script lang="ts">
    import { goto } from "$app/navigation";
    import Icon from "@iconify/svelte";
	import SearchService from "../SearchService";
	import SearchTarget from "../SearchTarget";
	import type GeneralSearchResponse from "../dtos/GeneralSearchResponse";

	export let query: string = "";

	const targets = [SearchTarget.Users];
	let selectedTarget: SearchTarget = targets[0];

	let loading = false;
	let error: string | null = null;
	let results: GeneralSearchResponse | null = null;
	let requestId = 0;

	async function runSearch(q: string, target: SearchTarget) {
		const trimmed = q.trim();
		if (!trimmed) {
			results = null;
			return;
		}

		const current = ++requestId;
		loading = true;
		error = null;

		try {
			const response = await SearchService.getInstance().search(trimmed, target);
			if (current === requestId) {
				results = response;
			}
		} catch (err) {
			if (current === requestId) {
				error = err instanceof Error ? err.message : "Search failed";
				results = null;
			}
		} finally {
			if (current === requestId) {
				loading = false;
			}
		}
	}

	$: if (query !== undefined && selectedTarget !== undefined) {
		void runSearch(query, selectedTarget);
	}

	function selectTarget(t: SearchTarget) {
		if (t === selectedTarget) return;
		selectedTarget = t;
		if (query.trim()) {
			void runSearch(query, t);
		}
	}
</script>

<section class="px-10 py-6 text-txt-main">
	<header class="flex items-center justify-between gap-3 mb-4">
		<div>
			<p class="text-sm text-neutral-400">Showing results for</p>
			<h1 class="text-xl font-semibold">“{query}”</h1>
		</div>
		{#if loading}
			<span class="text-sm text-neutral-400 flex items-center gap-2"><Icon icon="eos-icons:three-dots-loading" class="text-lg" /> Searching…</span>
		{/if}
	</header>

	<div class="flex gap-2 mb-4">
		{#each targets as t}
			<button
				class="px-3 py-2 text-sm rounded-lg border transition-colors {t === selectedTarget ? 'border-primary text-txt-main bg-primary/20' : 'border-border text-neutral-300 hover:bg-[#ffffff0a]'}"
				on:click={() => selectTarget(t)}
			>
				{t}
			</button>
		{/each}
	</div>

	{#if error}
		<div class="bg-[#ff4d4d1a] border border-[#ff4d4d44] text-[#ffb3b3] px-4 py-3 rounded-lg">{error}</div>
	{:else if !query.trim()}
		<p class="text-neutral-400">Type a query to see results.</p>
	{:else if loading && !results}
		<p class="text-neutral-400">Searching…</p>
	{:else}
		{#if !results || (!results.users || results.users.length === 0)}
			<p class="text-neutral-400">No results found.</p>
		{:else if results.users?.length}
			<section class="mt-2">
				<div class="flex items-center gap-2 mb-2">
					<Icon icon="solar:users-group-rounded-line-duotone" class="text-primary" />
					<h2 class="text-sm font-semibold uppercase tracking-wide">Users</h2>
					<span class="text-xs text-neutral-500">{results.users.length}</span>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{#each results.users as user}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div 
						class="flex items-center gap-3 bg-neutral-800/70 border border-border rounded-lg px-4 py-3 shadow-sm cursor-pointer hover:bg-neutral-800 transition-colors"
						on:click={() => goto(`/profile/${user.username}`)}
					>
							{#if user.avatarUrl}
								<img src={user.avatarUrl} alt={user.username} class="size-10 rounded-full object-cover" loading="lazy" />
							{:else}
								<div class="size-10 rounded-full bg-primary/30 grid place-items-center text-sm text-primary font-semibold">{user.username.slice(0, 2).toUpperCase()}</div>
							{/if}
							<div class="min-w-0">
								<p class="text-sm font-medium truncate">{user.username}</p>
								<p class="text-xs text-neutral-500">User</p>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</section>
