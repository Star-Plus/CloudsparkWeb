<script lang="ts">
	import UploadAgent from "../agents/upload/UploadAgent";
    import axios from "axios";
    import { page } from "$app/state";
	import ErrorStore from "$lib/features/errors/ErrorStore.svelte";
    import { getAuthContext } from "$lib/features/auth/AuthContext.svelte";

    const authService = getAuthContext().service;

    const agent = new UploadAgent(axios.create({baseURL: "http://localhost:3848"}),
        authService,
        "ws://localhost:3849",
        import.meta.env.VITE_VCS_API_URL
    );

    async function handleFileInput() {
        try {
            const filepath = await agent.openPickDialog();
            const normalizedFilepath = filepath.replaceAll("\\", "/");
    
            const parentDir = page.params.path || "";
            if (parentDir.split('/').length < 2) {
                throw new Error("Cannot upload to root directory");
            }
    
            const repoPath = parentDir.split("/").map(p => p == "vault" ? "$vault" : p).slice(0, 2).join("/");
            const nestedPath = parentDir.split("/").slice(2).join("/");
    
            const destination = repoPath + "/" + nestedPath + "/" + normalizedFilepath.split("/").pop();
            await agent.uploadFile(normalizedFilepath, destination);
        }
        catch (err: any) {
            ErrorStore.getInstance().add(err);
        }
    }

    let error = $state("");

</script>

<button class="flex items-center bg-background-200/50 hover:bg-background-300 py-2 px-4 rounded text-md!" onclick={handleFileInput}>
    <span class="material-symbols-rounded mr-2">
        upload
    </span>
    Upload
</button>