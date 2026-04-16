<script lang="ts">
	export let previewUrl: string;
	export let assetId: string;
</script>

<img src={previewUrl} alt="Asset preview for {assetId}" class="w-full h-full object-contain" />
