<script lang="ts">
    let {type, classes} : {type: string, classes?: string} = $props();
</script>

{#if type === "folder"}
<span class={`material-symbols-rounded text-primary-500 ${classes ?? ""}`}>
    folder
</span>
{:else}
<span class={`material-symbols-rounded text-secondary-500 ${classes ?? ""}`}>
    insert_drive_file
</span>
{/if}