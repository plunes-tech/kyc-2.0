import axios from 'axios';
import type { AxiosInstance } from "axios"
import { Config } from './config';

// Create an axios instance with default config
const api: AxiosInstance = axios.create({
    baseURL: Config.env==="production" ? Config.api.kycUrlProd : Config.api.kycUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    // timeout: 10000,
});

export default api;