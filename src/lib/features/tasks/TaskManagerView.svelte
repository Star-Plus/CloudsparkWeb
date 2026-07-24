<script lang="ts">
	import TaskManager from "./TaskManager.svelte";
	import TaskVisualizer from "./TaskVisualizer.svelte";
    
    const manager = TaskManager.getInstance();

</script>

<section>
    <h2 class="text-lg font-semibold">Tasks</h2>
    <ul>
        {#each manager.tasks as task (task.id)}
            <TaskVisualizer {task} />
        {/each}
    </ul>
</section>