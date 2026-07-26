import { createContext } from "svelte";

export class MockContext {
    isMock: boolean = false;
}

export const [getMockContext, setMockContext] = createContext<MockContext>();