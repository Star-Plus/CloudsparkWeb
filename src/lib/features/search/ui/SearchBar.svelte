<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Icon from "@iconify/svelte";
	let query = "";
	let lastUrlKey = "";

	$: {
		const urlKey = $page.url?.toString() ?? "";
		if (urlKey !== lastUrlKey) {
			lastUrlKey = urlKey;
			const urlQuery = $page.url?.searchParams.get("query") ?? "";
			query = urlQuery;
		}
	}

	function submitSearch() {
		const q = query.trim();
		if (!q) return;
		const params = new URLSearchParams({ query: q });
		goto(`/search?${params.toString()}`);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			event.preventDefault();
			submitSearch();
		}
	}

</script>

<div class="searchbar flex items-center gap-2 bg-neutral-800/80 border border-border rounded-lg px-3 py-1 min-w-[260px] max-w-[620px] shadow-sm backdrop-blur-sm">
	<div class="flex-1 flex items-center gap-2">
		<input
			class="w-full bg-transparent text-xs text-txt-main placeholder:text-neutral-500 focus:outline-none"
			placeholder="Search..."
			bind:value={query}
			on:keydown={handleKeydown}
		/>
		<button
			class="size-6 rounded-lg grid place-items-center text-neutral-300 hover:text-txt-main hover:bg-[#ffffff12] transition-colors"
			on:click={submitSearch}
			aria-label="Search"
		>
			<Icon icon="material-symbols:search-rounded" />
		</button>
	</div>
</div>

<style>
	button { cursor: pointer; }
</style>
