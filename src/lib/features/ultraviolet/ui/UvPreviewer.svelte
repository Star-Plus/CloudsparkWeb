<script lang="ts">
    import { onMount } from "svelte";
	import ImageScreen from "../players/ImageScreen.svelte";
	import UltraVioletService from "../services/UltraVioletService";
	import appApi from "$lib/utils/apis/appApi";
	import { useMock } from "$lib/utils/mock/useMock";
    import type { AxiosInstance } from "axios";
	import TextBook from "../players/TextBook.svelte";

    let {
        apiSource = appApi,
        isMock=false, 
        assetPath,
        mediaType,
        onClickOutside = () => {}
    } : {
        apiSource?: AxiosInstance, 
        assetPath: string, 
        isMock?: boolean,
        mediaType?: string,
        onClickOutside?: () => void
    } = $props();

    let container: HTMLDivElement;

    const uvService = $derived<UltraVioletService>(isMock ? useMock(new UltraVioletService(apiSource)) : new UltraVioletService(apiSource));
    
    let previewUrl = $state<string>("");

    onMount(() => {

        if (!mediaType) {
            mediaType = assetPath.split("/").pop();
        }

        if (mediaType == "image") {
            assetPath += "?width=" + deductWidth();
        }

        uvService.fetchFastPreviewUrl(assetPath).then((resp) => {
            if (resp.payload === null) return;
            previewUrl = resp.payload.previewUrl;
            console.log(previewUrl)
        })

        window.addEventListener("mousedown", (e: MouseEvent) => {
            if (!container.contains(e.target as Node)) {
                onClickOutside();
            }
        })
    })

    function deductWidth() : number {
        if (container) {
            return container.offsetWidth;
        }
        return 0;
    }
</script>

<div bind:this={container} class="max-w-full h-full">
    {#if mediaType == "image"}
    <ImageScreen imageUrl={previewUrl} />
    {:else if mediaType == "text"}
    <TextBook fileUrl={previewUrl} />
    {:else}
        <p class="text-center text-text-600">Unsupported media "{mediaType}" type</p>
    {/if}
</div>