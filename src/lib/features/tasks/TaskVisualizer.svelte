<!-- TaskVisualizer.svelte -->
<script lang="ts">
	import BoxTask from "./BoxTask.svelte.ts";
	import type ITask from "./ITask";
	import ProgressingTask from "./ProgressingTask.svelte";
	import TaskVisualizer from "./TaskVisualizer.svelte";
	import { slide, scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import { untrack } from "svelte";

	let { task }: { task: ITask } = $props();

	// ---- aggregate progress, used for the BoxTask ring ----
	function aggregate(t: ITask): [number, number] {
		if (t instanceof ProgressingTask) return [t.progress, t.total];
		if (t instanceof BoxTask) {
			return t.subtasks.reduce(
				([d, m], sub) => {
					const [sd, sm] = aggregate(sub);
					return [d + sd, m + sm];
				},
				[0, 0] as [number, number]
			);
		}
		return [0, 0];
	}

	let [aggDone, aggTotal] = $derived(aggregate(task));
	let aggPercent = $derived(aggTotal > 0 ? Math.round((aggDone / aggTotal) * 100) : 0);

	let percent = $derived(
		task instanceof ProgressingTask && task.total > 0
			? Math.round((task.progress / task.total) * 100)
			: 0
	);

	let done = $derived(task.isDone());

	// ---- speed history sampling, leaf tasks only ----
	type Sample = { t: number; v: number };
	let history = $state<Sample[]>([]);
	const MAX_SAMPLES = 20;

	$effect(() => {
		if (!(task instanceof ProgressingTask)) return;
		const v = task.progress; // the only value we want as a dependency
		untrack(() => {
			history = [...history, { t: performance.now(), v }].slice(-MAX_SAMPLES);
		});
	});

	let speeds = $derived.by(() => {
		const out: number[] = [];
		for (let i = 1; i < history.length; i++) {
			const dt = (history[i].t - history[i - 1].t) / 1000;
			const dv = history[i].v - history[i - 1].v;
			out.push(dt > 0 ? Math.max(dv / dt, 0) : 0);
		}
		return out;
	});

	const SPARK_W = 200;
	const SPARK_H = 34;

	let sparkLine = $derived.by(() => {
		if (speeds.length < 2) return "";
		const max = Math.max(...speeds, 1);
		const step = SPARK_W / (speeds.length - 1);
		return speeds
			.map((s, i) => {
				const x = i * step;
				const y = SPARK_H - (s / max) * (SPARK_H - 3) - 1.5;
				return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(" ");
	});

	let sparkFill = $derived(sparkLine ? `${sparkLine} L${SPARK_W},${SPARK_H} L0,${SPARK_H} Z` : "");
</script>

<div class="group relative">
	<div class="flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-background-100">
		<!-- status icon -->
		<div class="relative shrink-0 w-5 h-5 flex items-center justify-center">
			{#if done}
				<div in:scale={{ duration: 300, start: 0.4, easing: quintOut }} class="text-accent-600">
					<svg viewBox="0 0 20 20" fill="none" class="w-5 h-5">
						<circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15" />
						<path d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</div>
			{:else if task instanceof BoxTask}
				<svg viewBox="0 0 20 20" fill="none" class="w-4 h-4 text-primary-800">
					<path d="M10 2l7 3.5v9L10 18l-7-3.5v-9L10 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
					<path d="M3.5 5.5L10 9l6.5-3.5M10 9v9" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
				</svg>
			{:else}
				<span class="relative flex w-2.5 h-2.5">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-800 opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
				</span>
			{/if}
		</div>

		<!-- label -->
		<h4 class="text-sm font-medium text-background-900 truncate flex-1">{task.action}</h4>

		{#if task instanceof BoxTask}
			<!-- aggregate donut ring -->
			<div
				class="relative w-10 h-10 rounded-full shrink-0 transition-[background] duration-300"
				style="background: conic-gradient(rgb(99 102 241) {aggPercent}%, rgb(0 0 0 / 0.08) {aggPercent}%)"
			>
				<div class="absolute inset-1 rounded-full bg-background-50 flex items-center justify-center">
					<span class="text-[10px] font-semibold text-background-900">{aggPercent}</span>
				</div>
			</div>
		{:else if task instanceof ProgressingTask}
			<div class="flex items-center gap-4 shrink-0">
				<!-- speed sparkline -->
				{#if speeds.length > 1 && !done}
					<svg width={SPARK_W} height={SPARK_H} class="overflow-visible text-background-900">
						<defs>
							<linearGradient id="spark-{task.id}" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stop-color="currentColor" stop-opacity="0.35" />
								<stop offset="100%" stop-color="currentColor" stop-opacity="0" />
							</linearGradient>
						</defs>
						<path d={sparkFill} fill="url(#spark-{task.id})" stroke="none" />
						<path d={sparkLine} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				{/if}

				<!-- progress bar -->
				<div class="w-44 h-2 rounded-full bg-background-200/70 overflow-hidden">
					<div
						class="h-full rounded-full bg-linear-to-r from-background-900 to-background-800 transition-[width] duration-500 ease-out relative overflow-hidden"
						style="width: {percent}%"
					>
						{#if !done}
							<div class="absolute inset-0 shimmer"></div>
						{/if}
					</div>
				</div>

				<span class="text-xs font-medium text-background-600 tabular-nums w-8 text-right">{percent}%</span>
			</div>
		{/if}
	</div>

	{#if task instanceof BoxTask && task.subtasks.length > 0}
		<div class="relative pl-6 ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-background-300">
			{#each task.subtasks as subtask (subtask.id)}
				<div class="relative" transition:slide={{ duration: 250, easing: quintOut }}>
					<span class="absolute -left-6 top-5 w-4 h-px bg-background-300"></span>
					<TaskVisualizer task={subtask} />
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.shimmer {
		background: linear-gradient(
			110deg,
			transparent 0%,
			rgba(255, 255, 255, 0.183) 45%,
			rgba(255, 255, 255, 0.165) 55%,
			transparent 100%
		);
		background-size: 200% 100%;
		animation: shimmer-sweep 1.6s ease-in-out infinite;
	}

	@keyframes shimmer-sweep {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
</style>