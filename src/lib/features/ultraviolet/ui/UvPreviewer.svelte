<script lang="ts">
    import { onMount } from "svelte";
	import ImageScreen from "../players/ImageScreen.svelte";
	import UltraVioletService from "../services/UltraVioletService";
	import appApi from "$lib/utils/apis/appApi";
	import { useMock } from "$lib/utils/mock/useMock";

    let {width, height, isMock=false, assetPath} : {width: number, height: number, assetPath: string, isMock: boolean} = $props();

    let mediaType = $state<string>("");
    const uvService = $derived<UltraVioletService>(isMock ? useMock(new UltraVioletService(appApi)) : new UltraVioletService(appApi));
    
    let previewUrl = $state<string>("");

    onMount(() => {
        uvService.fetchFastPreviewUrl(assetPath).then((resp) => {
            if (resp.payload === null) return;
            mediaType = resp.payload.type.split("/")[0];
            previewUrl = resp.payload.url;
        })
    })
</script>

{#if mediaType == "image"}
    <ImageScreen width={width} height={height} imageUrl={previewUrl} />
{/if}