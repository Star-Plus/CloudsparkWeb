<script lang="ts">
    let {fileUrl} : {fileUrl: string} = $props();

    let content = $derived(fetch(fileUrl).then((resp) => resp.text()));
</script>

<div class="prose dark:prose-invert">
    {@html content}
</div>

