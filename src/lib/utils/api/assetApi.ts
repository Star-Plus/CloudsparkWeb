import AuthService from "$lib/features/auth/AuthService";
import axios from "axios";

const assetApi = axios.create({
    baseURL: import.meta.env.DEV ?  "http://localhost:8080/api" : "http://production-url/api",
    headers: {
        "Content-Type": "application/json",
    },
});

assetApi.interceptors.request.use((config) => {
    const token = AuthService.getInstance().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export function setAssetApiBaseUrl(url: string) {
    if (import.meta.env.VITE_TESTING === "true") {
        assetApi.defaults.baseURL = url + "/api";
    }   
}

export default assetApi;