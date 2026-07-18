<script lang="ts">
	import UploadAgent from "./UploadAgent";
    import axios from "axios";
    
    const agent = new UploadAgent(axios.create({
        baseURL: "http://localhost:3848"
    }))
    
    async function handleFileInput() {
        const filepath = await agent.openPickDialog();
        const normalizedFilepath = filepath.replaceAll("\\", "/");
        await agent.uploadFile(normalizedFilepath, "ahmed.mustafa.talaat@gmail.com/$vault/"+normalizedFilepath.split("/").pop());
    }

</script>

<button onclick={handleFileInput}>
    Pick File
</button>