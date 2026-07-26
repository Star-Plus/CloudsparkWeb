<!-- TaskBarSummary.svelte -->
<script lang="ts">
	import BoxTask from "$lib/features/tasks/BoxTask.svelte";
	import type ITask from "$lib/features/tasks/ITask";
	import ProgressingTask from "$lib/features/tasks/ProgressingTask.svelte";
	import TaskManager from "$lib/features/tasks/TaskManager.svelte";


    const manager = TaskManager.getInstance();

    function flatten(tasks: ITask[]): ProgressingTask[] {
        const leaves: ProgressingTask[] = [];
        for (const task of tasks) {
            if (task instanceof BoxTask) {
                leaves.push(...flatten(task.subtasks));
            } else if (task instanceof ProgressingTask) {
                leaves.push(task);
            }
        }
        return leaves;
    }

    let flatTasks = $derived(flatten(manager.tasks));
    let done = $derived(flatTasks.reduce((sum, t) => sum + t.progress, 0));
    let max = $derived(flatTasks.reduce((sum, t) => sum + t.total, 0));
    let percent = $derived(max > 0 ? Math.round((done / max) * 100) : 0);
    let activeCount = $derived(flatTasks.filter((t) => t.progress < t.total).length);
</script>

{#if flatTasks.length > 0}
    <div class="flex items-center gap-4 w-full">
        <span class="text-sm font-medium text-background-900 whitespace-nowrap">
            {activeCount} active task{activeCount === 1 ? "" : "s"} · {percent}%
        </span>
        <div class="flex-1 h-1 rounded-full bg-background-100/70 overflow-hidden">
            <div
                class="h-full rounded-full bg-background-900 transition-[width] duration-300 ease-out"
                style="width: {percent}%"
            ></div>
        </div>
    </div>

{:else}
    <div class="flex items-center gap-4 w-full">
        <span class="text-sm font-medium text-background-900 whitespace-nowrap">
            No active tasks
        </span>
    </div>
{/if}