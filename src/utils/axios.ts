import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios"

// Create an axios instance with default config
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    // timeout: 10000,
});

// refresh token logic
const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("Missing refresh token");

    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/mcm-users/get-access-token`, { refreshToken });
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
};

// Request interceptor to attach auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.url?.startsWith('/api/payments/')) {
            config.baseURL = import.meta.env.VITE_API_PAYMENT_URL || 'http://localhost:8080';
        } else {
            config.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        }
        return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    async (error: AxiosError): Promise<any> => {
        if (error.response?.status === 401) {
            console.log("401 error from api");
            const currentAccessToken = localStorage.getItem("accessToken");
            if(currentAccessToken) {
                try {
                    // Refresh the access token
                    const newAccessToken = await refreshAccessToken();
    
                    const originalRequest = error.config;
    
                    if (originalRequest && newAccessToken) {
                        // Axios v1+ uses AxiosHeaders, so use .set() instead of direct assignment
                        originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
    
                        return api(originalRequest); // Retry the request
                    }
                } catch (refreshError) {
                    // Clear storage and reject
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("user");
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;