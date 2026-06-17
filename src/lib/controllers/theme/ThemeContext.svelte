<script lang="ts">

    import { onMount } from "svelte";
	import ThemeController from "./ThemeController";

    onMount(() => {
        ThemeController.getInstance();
    });

</script>