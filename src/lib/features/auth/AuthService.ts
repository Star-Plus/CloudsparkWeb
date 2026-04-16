import type GoogleLoginRequest from "./Dtos/GoogleLoginRequest";
import type AuthLoginResponse from "./Dtos/AuthLoginResponse";
import api from "$lib/utils/api/appApi";
import User from "./User";

export default class AuthService {

    private static instance : AuthService;

    private constructor() {
        this.user = localStorage.getItem("user") ? new User(JSON.parse(localStorage.getItem("user") as string).username) : null;
    }

    private user: User | null = null;

    public static getInstance() : AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }

        return AuthService.instance;
    }

    async googleLogin(request: GoogleLoginRequest) : Promise<AuthLoginResponse> {
        try {
            const response = await api.post<AuthLoginResponse>("/auth/google", request);
            this.authenticateUser(response.data.token, new User(response.data.username));
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }

    private authenticateUser(token: string, user: User): void {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        this.user = user;
    }

    public getUser(): User | null {
        return this.user;
    }

    public logout(): void {
        localStorage.removeItem("token");
    }

    public isAuthenticated(): boolean {
        return localStorage.getItem("token") !== null;
    }

    public get token(): string | null {
        return localStorage.getItem("token");
    }

}