<script lang="ts">
    import Icon from "@iconify/svelte";
    import { open } from "@tauri-apps/plugin-dialog"
    import RepositoryBuilder from "../RepositoryBuilder";
    import RepositoryStore from "../RepositoryStore";

    const selectDirectory = async () => {
        const selected = await open({
            directory: true,
            multiple: false,
            title: "Select Repository Directory"
        });

        console.log("Selected directory:", selected);

        if (selected){
            const createdRepo = await RepositoryBuilder.buildRepository(selected, false);
            await RepositoryStore.getInstance().addRepository(createdRepo);
        }
    };

</script>
<button class="btn btn-secondary" on:click={selectDirectory}>
    <Icon icon="mdi:folder-open" />
    <span>Open Repository</span>
</button>

<style>
    .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
        transition: all 0.15s ease;
        border: 1px solid transparent;
        user-select: none;
        cursor: pointer;
    }

    .btn-secondary {
        color: var(--color-txt-main, rgba(255,255,255,0.9));
        background: transparent;
        border-color: rgba(255, 255, 255, 0.15);
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.25);
    }

    .btn-secondary:active {
        transform: scale(0.98);
    }
</style>