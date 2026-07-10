<script lang="ts">
	import { onMount } from "svelte";

    let {fileUrl} : {fileUrl: string} = $props();

    let content = $state("");

    onMount(() => {
        fetch(fileUrl).then((response) => {
            response.text().then((text) => {
                content = text;
            })
        })
    })
</script>

<div class="prose dark:prose-invert">
    {@html content}
</div>

