<script lang="ts">
	import BoxTask from "./BoxTask.svelte";
	import type ITask from "./ITask";
	import ProgressingTask from "./ProgressingTask.svelte";
    import TaskVisualizer from "./TaskVisualizer.svelte";

    let {task} : {task: ITask} = $props();

</script>

<div>
    <h4>{task.action}</h4>

    {#if task instanceof BoxTask}
        <div class="pr-3">
            {#each task.subtasks as subtask (subtask.action)}
                <TaskVisualizer task={subtask} />
            {/each}
        </div>
    {:else if task instanceof ProgressingTask}
        <progress value={task.progress} max={task.total}></progress>
    {/if}
</div>