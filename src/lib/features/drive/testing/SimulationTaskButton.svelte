<!-- SimulateTaskButton.svelte -->
<script lang="ts">
	import BoxTask from "$lib/features/tasks/BoxTask.svelte";
	import ProgressingTask from "$lib/features/tasks/ProgressingTask.svelte";
	import TaskManager from "$lib/features/tasks/TaskManager.svelte";


    const manager = TaskManager.getInstance();

    const SAMPLE_STEPS = [
        "Uploading files",
        "Processing metadata",
        "Generating thumbnails",
        "Syncing to cloud",
        "Indexing content",
    ];

    function randomSubtask(): ProgressingTask {
        const action = SAMPLE_STEPS[Math.floor(Math.random() * SAMPLE_STEPS.length)];
        const total = 20 + Math.floor(Math.random() * 60);
        return new ProgressingTask(action, total);
    }

    function simulateTask() {
        const subtaskCount = 2 + Math.floor(Math.random() * 3);
        const subtasks = Array.from({ length: subtaskCount }, randomSubtask);
        const box = new BoxTask("Simulated batch job", subtasks);

        manager.addTask(box);

        const interval = setInterval(() => {
            for (const sub of subtasks) {
                if (!sub.isDone()) {
                    sub.increment(1 + Math.floor(Math.random() * 4));
                }
            }

            if (subtasks.every((sub) => sub.isDone())) {
                clearInterval(interval);
                box.close();
            }
        }, 300);
    }
</script>

<button
    onclick={simulateTask}
    class="fixed bottom-12 right-0 m-4 px-4 py-2 rounded-lg bg-background-900 text-background-50 text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.98]"
>
    Simulate Task
</button>