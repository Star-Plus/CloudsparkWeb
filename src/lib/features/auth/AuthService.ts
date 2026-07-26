import { Mockable } from "$lib/utils/mock/Mockable";
import type { AxiosInstance } from "axios";
import type LoginResponse from "./dtos/LoginResponse";
import User from "./User.model";
import { browser } from "$app/environment";

export default class AuthService extends Mockable {
    
    private user: User | null = null;
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
        // On initialization, check if we have credentials in localStorage
        if (browser) {
            const token = localStorage.getItem("token");
            const username = localStorage.getItem("username");
            const userId = localStorage.getItem("userId");
            if (token && username && userId) {
                this.user = new User({
                    id: userId,
                    username,
                    token
                });
            }
        }
    }

    saveCredentials(user: User) {
        localStorage.setItem("token", user.token);
        localStorage.setItem("username", user.username);
        localStorage.setItem("userId", user.id);
        this.user = user;
    }

    isAuthenticated(): boolean {
        const token = localStorage.getItem("token");
        return !!token;
    }

    getUser(): User | null {
        return this.user;
    }

    mock_getUser(): User | null {
        return new User({
            id: "ahmed",
            username: "ahmed",
            token: "ahmed"
        })
    }

    async googleSignIn(idToken: string) : Promise<LoginResponse> {
        try {
            // Fire off the secure token exchange
            const response = await this.api.post<LoginResponse>("/auth/google", {
                idToken
            });
            
            const loginRes = response.data;

            console.log("Backend login successful. Hello,", loginRes.username);

            const user = new User({
                token: loginRes.token,
                username: loginRes.username,
                id: loginRes.id
            });

            // Store securely in browser layout
            this.saveCredentials(user);

            return loginRes;

        } catch (err) {
            throw new Error(`Google Sign-In failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

}