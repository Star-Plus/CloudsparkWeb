<script lang="ts">

    import { onMount } from "svelte";
	import ThemeController from "./ThemeController.svelte";

    onMount(() => {
        ThemeController.getInstance();
    });

</script>