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

        
        if (selected){
            console.log("Selected directory for init:", selected);
            const createdRepo = await RepositoryBuilder.buildRepository(selected);
            await RepositoryStore.getInstance().addRepository(createdRepo);
        }
    };

</script>
<button class="btn btn-primary" on:click={selectDirectory}>
    <Icon icon="mdi:plus" />
    <span>New Repository</span>
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

    .btn-primary {
        color: white;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        border-color: #7c3aed;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
    }

    .btn-primary:hover {
        background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        transform: translateY(-1px);
    }

    .btn-primary:active {
        transform: translateY(0);
    }
</style>