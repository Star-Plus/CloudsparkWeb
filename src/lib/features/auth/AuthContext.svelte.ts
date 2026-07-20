import {createContext} from "svelte";
import type AuthService from "./AuthService";

export class AuthContext {
    service: AuthService;

    constructor(service: AuthService) {
        this.service = service;
    }
}

export const [getAuthContext, setAuthContext] = createContext<AuthContext>();