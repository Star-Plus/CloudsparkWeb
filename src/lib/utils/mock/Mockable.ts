export class Mockable {
  #mock: boolean;
 
  constructor(mock = false) {
    this.#mock = mock;
 
    return new Proxy(this, {
      get: (target, prop: string, receiver) => {
        const value = Reflect.get(target, prop, receiver);
 
        // Only intercept callable, non-internal, non-mock_ members
        if (
          typeof value !== "function" ||
          prop.startsWith("mock_") ||
          prop.startsWith("#") ||
          prop === "constructor"
        ) {
          return value;
        }
 
        return (...args: unknown[]) => {
          if (target.#mock) {
            const mockFn = (target as Record<string, unknown>)[`mock_${prop}`];
            if (typeof mockFn === "function") {
              return (mockFn as (...a: unknown[]) => unknown).apply(
                target,
                args
              );
            }
            // No mock twin found — fall through to real, warn in dev
            if (import.meta.env?.DEV) {
              console.warn(
                `[Mockable] mock_${prop} not found on ${target.constructor.name}. Falling back to real implementation.`
              );
            }
          }
          return (value as (...a: unknown[]) => unknown).apply(target, args);
        };
      },
    });
  }
 
  isMock(): boolean {
    return this.#mock;
  }
 
  mock() {
    this.#mock = true;
  }

  unmock() {
    this.#mock = false;
  }
}