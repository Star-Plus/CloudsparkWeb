import AuthService from "$lib/features/auth/AuthService";
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.DEV ?  "https://localhost:5000/api" : "https://158.101.230.143/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = AuthService.getInstance().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export function setApiBaseUrl(url: string) {
    if (import.meta.env.VITE_TESTING === "true") {
        api.defaults.baseURL = url + "/api";
    }
}

export default api;