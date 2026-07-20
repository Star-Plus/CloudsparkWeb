<script lang="ts">
	import DownloadAgent from "../agents/download/DownloadAgent";
	import axios from "axios";

    let {objectPath} : {objectPath: string} = $props();

    async function handleOnClick() {
        const agent = new DownloadAgent(
            axios.create({baseURL: "http://localhost:3848"}), 
            "ws://localhost:3849", 
            import.meta.env.VITE_VCS_API_URL,
        );

        console.log("Downloading", objectPath);

        const saveDest = await agent.openSaveFileDialog(objectPath.split("/").pop() ?? "");
        agent.download(objectPath, saveDest);
        console.log(saveDest);
    }
</script>

<button type="button" onclick={handleOnClick}>
    <span class="material-symbols-rounded">
    arrow_circle_down
    </span>
</button>