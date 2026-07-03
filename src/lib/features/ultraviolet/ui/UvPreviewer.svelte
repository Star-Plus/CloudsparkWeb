<script lang="ts">
    import { onMount } from "svelte";
	import ImageScreen from "../players/ImageScreen.svelte";
	import UltraVioletService from "../services/UltraVioletService";
	import appApi from "$lib/utils/apis/appApi";
	import { useMock } from "$lib/utils/mock/useMock";
    import type { AxiosInstance } from "axios";

    let {
        apiSource = appApi,
        isMock=false, 
        assetPath,
        onClickOutside = () => {}
    } : {
        apiSource?: AxiosInstance, 
        assetPath: string, 
        isMock?: boolean,
        onClickOutside?: () => void
    } = $props();

    let container: HTMLDivElement;

    let mediaType = $state<string>("");
    const uvService = $derived<UltraVioletService>(isMock ? useMock(new UltraVioletService(apiSource)) : new UltraVioletService(apiSource));
    
    let previewUrl = $state<string>("");

    onMount(() => {

        if (mediaType == "image") {
            assetPath += "?width=" + deductWidth();
        }

        uvService.fetchFastPreviewUrl(assetPath).then((resp) => {
            if (resp.payload === null) return;
            mediaType = resp.payload.type.split("/")[0];
            previewUrl = resp.payload.url;
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
    {/if}
</div>