import appApi from "$lib/utils/apis/appApi";
import type LoginResponse from "./dtos/LoginResponse";
import User from "./User.model";

export default class AuthService {

    static instance: AuthService;
    
    private user: User | null = null;

    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private constructor() {
        // On initialization, check if we have credentials in localStorage
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

    async googleSignIn(idToken: string) : Promise<LoginResponse> {
        try {
            // Fire off the secure token exchange
            const response = await appApi.post<LoginResponse>("/auth/google", {
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