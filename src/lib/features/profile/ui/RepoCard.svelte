<script lang="ts">
	import Icon from "@iconify/svelte";
	import type { RepositoryPayload } from "../dtos/RepositoryResponse";

    let {repo} : {repo: RepositoryPayload} = $props();

</script>
<div class="border-b border-background-200 p-2">

    <a href="/" class="inline text-lg font-extrabold text-primary-950 hover:text-primary-600 transition-colors duration-200">
        <Icon icon="mynaui:cloud" class="inline -translate-y-0.5 mr-1" />
        <h3 class="inline">{repo.name}</h3>
    </a>

    <span class="text-sm text-text-700 inline float-end rounded-full border border-background-300 py-1 px-3">
        {repo.public ? "Public" : "Private"}
    </span>
</div>