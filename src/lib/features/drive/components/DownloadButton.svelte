<script lang="ts">
    import Icon from "@iconify/svelte";
	import DownloadAgent from "../agents/download/DownloadAgent";
	import axios from "axios";

    let {objectPath} : {objectPath: string} = $props();

    async function handleOnClick() {
        const agent = new DownloadAgent(
            axios.create({baseURL: "http://localhost:3848"}), 
            "ws://localhost:3849", 
            import.meta.env.VITE_VCS_API_URL,
        );

        const saveDest = await agent.openSaveFileDialog(objectPath.split("/").pop() ?? "");
        console.log(saveDest);
    }
</script>

<button type="button" onclick={handleOnClick}>
    <Icon icon="material-symbols:download-rounded" class="text-2xl" />
</button>