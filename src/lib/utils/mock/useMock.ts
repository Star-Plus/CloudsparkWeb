import type { Mockable } from "$lib/utils/mock/Mockable";

export function useMock<T extends Mockable>(service: T, prefix: string = "mock_"): T {
    service.mock();
    service.setMockPrefix(prefix);
    return service;
}