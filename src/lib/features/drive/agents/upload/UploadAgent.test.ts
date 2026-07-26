import axios, { type AxiosInstance } from "axios";
import MockAdapter from "axios-mock-adapter";
import UploadAgent from "./UploadAgent";

const mockTasks: unknown[] = [];
const mockTaskManager = {
    tasks: mockTasks,
    addTask: jest.fn((task: unknown) => {
        mockTasks.push(task);
    })
};

jest.mock("$lib/features/tasks/TaskManager.svelte", () => ({
    __esModule: true,
    default: {
        getInstance: () => mockTaskManager
    }
}));

jest.mock("$lib/features/tasks/BoxTask.svelte", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        open: jest.fn(),
        close: jest.fn()
    }))
}));

class MockWebSocket {
    static instances: MockWebSocket[] = [];
    static lastUrl?: string;

    static reset() {
        MockWebSocket.instances = [];
        MockWebSocket.lastUrl = undefined;
    }

    public onopen: ((event: Event) => void) | null = null;
    public onmessage: ((event: MessageEvent) => void) | null = null;
    public onerror: ((event: Event) => void) | null = null;
    public onclose: ((event: CloseEvent) => void) | null = null;

    constructor(url: string) {
        MockWebSocket.instances.push(this);
        MockWebSocket.lastUrl = url;
        setTimeout(() => {
            if (typeof this.onopen === "function") {
                this.onopen(new Event("open"));
            }
            if (typeof this.onmessage === "function") {
                this.onmessage(new MessageEvent("message", { data: JSON.stringify({ progress: 42, status: "uploading" }) }));
            }
        }, 0);
    }

    close() {
        this.onclose?.(new CloseEvent("close"));
    }
}

(globalThis as typeof globalThis & { WebSocket: typeof WebSocket }).WebSocket = MockWebSocket as unknown as typeof WebSocket;
(globalThis as typeof globalThis & { window: Window }).window.WebSocket = MockWebSocket as unknown as typeof WebSocket;
(globalThis as typeof globalThis & { global: typeof globalThis }).global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

test("Tesing agent web socket message handling", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    MockWebSocket.reset();

    const api = axios.create() as AxiosInstance;
    const agent = new UploadAgent(api, "ws://localhost", "https://euler.com");

    mockTasks.length = 0;
    mockTaskManager.addTask.mockClear();

    agent.handlePushSocket("Ahmed/Repo");
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockTasks.length).toBe(1);
    expect(mockTaskManager.addTask).toHaveBeenCalledTimes(1);

    expect(MockWebSocket.instances).toHaveLength(1);

    expect(MockWebSocket.lastUrl).toContain("ws://localhost");
    expect(MockWebSocket.instances[0].onopen).toBeDefined();
    expect(MockWebSocket.instances[0].onmessage).toBeDefined();

    logSpy.mockRestore();
    errorSpy.mockRestore();
})

test("Testing upload integration with mocked REST server", async () => {
    const api = axios.create() as AxiosInstance;
    const mock = new MockAdapter(api, { delayResponse: 100 });

    mock.onAny().reply((config) => {
        return [200, config.url ?? "ok"];
    });

    const agent = new UploadAgent(api, undefined, "https://euler.com");

    await expect(agent.uploadFile("ahmed.txt", "Ahmed/Repo/ahmed.txt")).resolves.toBeUndefined();

    mock.restore();

    await expect(agent.uploadFile("ahmed.txt", "Ahmed/Repo/ahmed.txt")).rejects.toThrow();
});