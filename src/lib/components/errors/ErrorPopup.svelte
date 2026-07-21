<script lang="ts">
    let {message, onClose} : {message: string, onClose: () => void} = $props();
</script>

<div class="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-neutral-900/80">
    <p class="text-red-700 text-lg font-normal text-center">{message}</p>
    <button class="absolute top-2 right-2" onclick={onClose}>
        <span class="material-symbols-rounded">close</span>
    </button>
</div>