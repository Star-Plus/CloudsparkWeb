<script lang="ts">
    let {imageUrl, width, height} : {imageUrl: string, width: number, height: number} = $props();
</script>

<div style="width: {width}px; height: {height}px; background-image: url({imageUrl}); background-size: cover; pointer-events: none; user-select: none;"></div>