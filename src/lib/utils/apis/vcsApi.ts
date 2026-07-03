import axios from "axios";

const vcsApi = axios.create({
    baseURL: import.meta.env.VITE_VCS_API_URL + "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

vcsApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default vcsApi;
