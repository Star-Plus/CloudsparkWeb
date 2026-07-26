import type { Mockable } from "./Mockable";

export function useError<T extends Mockable>(service: T): T {
    service.setMockPrefix("error_");
    service.mock();
    return service;
}