<script lang="ts">
    import type Repository from "$lib/features/repos/Repository";
    import RemoteCollaborators from "./RemoteCollaboratorSettings.svelte";

    export let repo: Repository | null = null;
</script>

<div class="space-y-6">
    {#if repo}
        <RemoteCollaborators {repo} />
    {/if}
    <!-- Additional remote settings sections can be added here -->
</div>
