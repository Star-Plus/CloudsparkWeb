<script lang="ts">
	import UploadAgent from "../agents/UploadAgent";
    import axios from "axios";
    import { page } from "$app/state";
	import Icon from "@iconify/svelte";


    const agent = new UploadAgent(axios.create({
        baseURL: "http://localhost:3848"
    }));

    async function handleFileInput() {
        const filepath = await agent.openPickDialog();
        const normalizedFilepath = filepath.replaceAll("\\", "/");

        const parentDir = page.params.path || "";
        if (parentDir.split('/').length < 2) {
            throw new Error("Cannot upload to root directory");
        }

        const destination = parentDir + "/" + normalizedFilepath.split("/").pop();
        await agent.uploadFile(normalizedFilepath, destination);
    }

</script>

<button class="flex items-center bg-background-200 hover:bg-background-300 py-2 px-4 rounded" onclick={handleFileInput}>
    <Icon icon="material-symbols:upload-rounded" class="mr-2" />
    Upload
</button>