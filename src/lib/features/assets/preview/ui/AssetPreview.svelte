<script lang="ts">
	import LiveAssetPreviewService from "../LiveAssetPreviewService";
	import { RendererStrategy } from "./renderers/rendererStrategy";
	import ImageRenderer from "./renderers/ImageRenderer.svelte";
	import TextRenderer from "./renderers/TextRenderer.svelte";
	import LoadingRenderer from "./renderers/LoadingRenderer.svelte";
	import ErrorRenderer from "./renderers/ErrorRenderer.svelte";
	import UnsupportedRenderer from "./renderers/UnsupportedRenderer.svelte";


	export let asset: { id: string; type: string };
	export let remoteId: string;
	export let onLoaded: (() => void) | null = null;
	export let onError: ((error: Error) => void) | null = null;

	let previewUrl: string | null = null;
	let previewContent: string | null = null;
	let isLoading = true;
	let errorMessage: string | null = null;
	let previewType: string | null = null;

	async function loadPreview() {
		isLoading = true;
		errorMessage = null;
		previewUrl = null;
		previewContent = null;

		try {
			const resp = await LiveAssetPreviewService.getPreviewUrl(remoteId, asset);
			previewType = resp.previewType;
			const rendererType = RendererStrategy.getRenderer(resp.previewType);

			if (rendererType === "text") {
				// For text files, fetch and display content
				const response = await fetch(resp.previewUrl);
				if (!response.ok) throw new Error("Failed to fetch text content");
				previewContent = await response.text();
			} else if (rendererType === "image") {
				// For image files, use the URL directly
				previewUrl = resp.previewUrl;
			} else {
				// For unsupported types, try to use as image first, fallback to unsupported view
				previewUrl = resp.previewUrl;
			}

			// Dispatch loaded event and call callback
			onLoaded?.();
		} catch (error) {
			console.error("Failed to load asset preview", error);
			const err = error instanceof Error ? error : new Error(String(error));
			errorMessage = err.message;
			
			// Dispatch error event and call callback
			onError?.(err);
		} finally {
			isLoading = false;
		}
	}

	$: if (asset && remoteId) {
		loadPreview();
	}

	$: rendererType = isLoading
		? "loading"
		: errorMessage
			? "error"
			: RendererStrategy.getRenderer(previewType || "");

</script>


<div class="asset-preview w-full h-full flex flex-col items-center justify-center bg-neutral-900 rounded-lg border border-border overflow-hidden">
	{#if rendererType === "loading" && previewType !== null}
		<LoadingRenderer />
	{:else if rendererType === "error"}
		<ErrorRenderer message={errorMessage || "An error occurred"} />
	{:else if rendererType === "image" && previewUrl}
		<ImageRenderer {previewUrl} assetId={asset.id} />
	{:else if rendererType === "text" && previewContent}
		<TextRenderer content={previewContent} previewType={previewType as string} />
	{:else}
		<UnsupportedRenderer previewType={previewType as string} />
	{/if}
</div>

<style>
	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
