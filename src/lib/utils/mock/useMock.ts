import type { Mockable } from "$lib/utils/mock/Mockable";

export function useMock<T extends Mockable>(service: T): T {
    service.mock();
    return service;
}