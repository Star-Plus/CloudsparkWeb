<script lang="ts">
    import { logStore } from "./logStore";
    import LOG_TYPE from "./LOG_TYPE";
    import { onMount, onDestroy } from "svelte";

    let filteredType: string | null = null;
    let allLogs: any[] = [];
    let unsubscribe: any;

    onMount(()=> {
        console.log("🔌 LogPage mounted, subscribing to logStore");
        unsubscribe = logStore.subscribe(logs => {
            console.log("📨 Subscription callback triggered with:", logs);
            allLogs = logs;
        });
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    $: filteredLogs = filteredType
        ? allLogs.filter(log => log.type === filteredType)
        : allLogs;

    const getLogColor = (type: string): string => {
        switch (type) {
            case LOG_TYPE.ERROR:
                return "#E9001F";
            case LOG_TYPE.WARN:
                return "#FFA500";
            case LOG_TYPE.INFO:
                return "#0BD900";
            case LOG_TYPE.DEBUG:
                return "#8838FF";
            default:
                return "#C0C0C0";
        }
    };

    const clearLogs = () => {
        logStore.set([]);
    };

    const getTypeSymbol = (type: string): string => {
        switch (type) {
            case LOG_TYPE.ERROR:
                return "✕";
            case LOG_TYPE.WARN:
                return "△";
            case LOG_TYPE.INFO:
                return "◉";
            case LOG_TYPE.DEBUG:
                return "⚙";
            default:
                return "•";
        }
    };
</script>

<div class="log-container">
    <div class="log-header">
        <div class="header-title-section">
            <div class="title-wrapper">
                <h1>System Logs</h1>
                <div class="title-accent"></div>
            </div>
            <p class="subtitle">Real-time application events</p>
        </div>
        <div class="header-controls">
            <div class="filter-group">
                <button
                    class="filter-btn"
                    class:active={filteredType === null}
                    on:click={() => (filteredType = null)}
                >
                    All
                </button>
                {#each [LOG_TYPE.INFO, LOG_TYPE.DEBUG, LOG_TYPE.WARN, LOG_TYPE.ERROR] as type}
                    <button
                        class="filter-btn"
                        class:active={filteredType === type}
                        on:click={() => (filteredType = type)}
                        style="--filter-color: {getLogColor(type)}"
                    >
                        {type}
                    </button>
                {/each}
            </div>
            <div class="log-stats">
                <span class="stat">{filteredLogs.length}</span>
            </div>
            <button class="clear-btn" on:click={clearLogs}>Clear</button>
        </div>
    </div>

    <div class="log-list">
        {#if filteredLogs.length === 0}
            <div class="empty-state">
                <div class="empty-icon">◆</div>
                <p>No logs to display</p>
            </div>
        {:else}
            {#each filteredLogs as log, index (index)}
                <div
                    class="log-item"
                    class:error={log.type === LOG_TYPE.ERROR}
                    class:warn={log.type === LOG_TYPE.WARN}
                    class:info={log.type === LOG_TYPE.INFO}
                    class:debug={log.type === LOG_TYPE.DEBUG}
                >
                    <div
                        class="log-badge"
                        style="background: linear-gradient(135deg, {getLogColor(log.type)}, {getLogColor(log.type)}dd); box-shadow: 0 0 16px {getLogColor(log.type)}40"
                    >
                        {getTypeSymbol(log.type)}
                    </div>
                    <div class="log-content">
                        <div class="log-message">{log.message}</div>
                        <div class="log-footer">
                            <span class="log-type" style="color: {getLogColor(log.type)}">{log.type}</span>
                            {#if log.source}
                                <span class="log-source">{log.source}</span>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .log-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--color-background);
        color: var(--color-txt-main);
        font-family: var(--font-primary);
    }

    .log-header {
        position: sticky;
        top: 30px;
        padding: 2rem 2.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 2rem;
        background: linear-gradient(180deg, var(--color-background) 20%, #1c1c1c 100%);
        z-index: 100;
    }

    .header-title-section {
        flex: 1;
    }

    .title-wrapper {
        position: relative;
        display: inline-block;
        margin-bottom: 0.5rem;
    }

    .log-header h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: -0.8px;
        background: linear-gradient(135deg, var(--color-txt-main) 0%, var(--color-txt-muted) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .title-accent {
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 3rem;
        height: 3px;
        background: var(--color-primary);
        border-radius: 2px;
    }

    .subtitle {
        margin: 0.75rem 0 0 0;
        font-size: 0.95rem;
        color: var(--color-txt-muted);
        font-weight: 400;
        letter-spacing: 0.3px;
    }

    .header-controls {
        display: flex;
        gap: 1.25rem;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    .filter-group {
        display: flex;
        gap: 0.6rem;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 0.5rem;
        border-radius: 0.6rem;
        backdrop-filter: blur(10px);
    }

    .filter-btn {
        padding: 0.55rem 1.1rem;
        background-color: transparent;
        border: none;
        color: var(--color-txt-muted);
        border-radius: 0.4rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: var(--font-primary);
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        position: relative;
    }

    .filter-btn:hover {
        color: var(--color-txt-main);
    }

    .filter-btn.active {
        background: linear-gradient(135deg, var(--filter-color, var(--color-primary)), var(--filter-color, var(--color-primary))dd);
        color: var(--color-txt-main);
        box-shadow: 0 4px 16px var(--filter-color, var(--color-primary))40, inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .log-stats {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .stat {
        font-size: 1.5rem;
        font-weight: 700;
        min-width: 40px;
        text-align: center;
    }

    .clear-btn {
        padding: 0.55rem 1.2rem;
        background-color: rgba(233, 0, 31, 0.12);
        border: 1.5px solid rgba(233, 0, 31, 0.3);
        color: var(--color-error);
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: var(--font-primary);
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }

    .clear-btn:hover {
        background-color: rgba(233, 0, 31, 0.2);
        border-color: var(--color-error);
        box-shadow: 0 4px 16px rgba(233, 0, 31, 0.25);
    }

    .log-list {
        flex: 1;
        overflow-y: auto;
        padding: 0;
        display: flex;
        flex-direction: column;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--color-txt-muted);
        gap: 1rem;
    }

    .empty-icon {
        font-size: 3rem;
        opacity: 0.3;
    }

    .empty-state p {
        font-size: 1rem;
        margin: 0;
        font-weight: 500;
    }

    .log-item {
        display: flex;
        gap: 1.2rem;
        padding: 1.2rem 2rem;
        border-bottom: 1px solid var(--color-border);
        transition: all 0.2s ease;
        align-items: flex-start;
        position: relative;
        overflow: hidden;
    }

    .log-item::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--color-border), transparent);
    }

    .log-item:hover {
        background-color: rgba(107, 82, 247, 0.04);
    }

    .log-item.error:hover {
        background-color: rgba(233, 0, 31, 0.04);
    }

    .log-item.warn:hover {
        background-color: rgba(255, 165, 0, 0.04);
    }

    .log-item.info:hover {
        background-color: rgba(11, 217, 0, 0.04);
    }

    .log-item.debug:hover {
        background-color: rgba(136, 56, 255, 0.04);
    }

    .log-badge {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.1rem;
        font-weight: 700;
        flex-shrink: 0;
        margin-top: 0.15rem;
    }

    .log-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        min-width: 0;
    }

    .log-message {
        font-size: 0.95rem;
        word-break: break-word;
        line-height: 1.5;
        color: var(--color-txt-main);
        font-weight: 500;
    }

    .log-footer {
        display: flex;
        gap: 1.5rem;
        font-size: 0.8rem;
        align-items: center;
    }

    .log-type {
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        min-width: 60px;
    }

    .log-source {
        color: var(--color-txt-muted);
        word-break: break-all;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 0.75rem;
        opacity: 0.8;
    }

    @media (max-width: 768px) {
        .log-header {
            flex-direction: column;
            gap: 1.5rem;
            padding: 1.5rem 1.5rem;
        }

        .log-header h1 {
            font-size: 1.5rem;
        }

        .header-controls {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
        }

        .filter-group {
            width: 100%;
            flex-wrap: wrap;
            justify-content: center;
        }

        .log-stats {
            justify-content: center;
        }

        .clear-btn {
            width: 100%;
        }

        .log-item {
            gap: 1rem;
            padding: 1rem 1.5rem;
        }
    }
</style>