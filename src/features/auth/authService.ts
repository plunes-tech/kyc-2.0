import api from '../../utils/axios';
import type { LoginCredentials, RegisterData, User, AuthResponse, MessageResponse, PasswordResetData, OtpPayload, OTPResponse, PasswordChangeData, ChangePasswordResponse } from './types';

const AUTH_ENDPOINTS = {
    LOGIN: '/api/mcm-users/login',
    VERIFY_OTP: 'api/mcm-users/validate-otp',
    RESEND_OTP: 'api/mcm-users/resend-otp',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    // VERIFY_EMAIL: '/auth/verify-email',
    REQUEST_PASSWORD_RESET: 'api/mcm-users/forgot-password',
    RESET_PASSWORD: 'api/mcm-users/forgot-password',
    CHANGE_PASSWORD: 'api/mcm-users/change-password',
    GET_CURRENT_USER: '/auth/me',
};

const authService = {

    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials)
        return response.data;
    },

    verifyOtp: async (payload: OtpPayload): Promise<OTPResponse> => {
        const response = await api.post<OTPResponse>(AUTH_ENDPOINTS.VERIFY_OTP, payload);
        if (response.data.accessToken && response.data.refreshToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    resendOtp: async (userId: string): Promise<OTPResponse> => {
        const response = await api.post<OTPResponse>(`${AUTH_ENDPOINTS.RESEND_OTP}/${userId}`, {})
        return response.data
    },

    register: async (userData: RegisterData): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>(AUTH_ENDPOINTS.REGISTER, userData);
        return response.data;
    },

    logout: async (): Promise<void> => {
        try {
            await api.post<MessageResponse>(AUTH_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    // verifyEmail: async (otp: string): Promise<MessageResponse> => {
    //     const response = await api.post<MessageResponse>(`${AUTH_ENDPOINTS.VERIFY_EMAIL}/${token}`);
    //     return response.data;
    // },

    requestPasswordReset: async (email: string): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>(AUTH_ENDPOINTS.REQUEST_PASSWORD_RESET, { email });
        return response.data;
    },

    resetPassword: async (token: string, passwordData: PasswordResetData): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>(`${AUTH_ENDPOINTS.RESET_PASSWORD}/${token}`, passwordData);
        return response.data;
    },

    changePassword: async (payload: PasswordChangeData): Promise<ChangePasswordResponse> => {
        const response = await api.post<ChangePasswordResponse>(`${AUTH_ENDPOINTS.CHANGE_PASSWORD}`, { ...payload });
        return response.data;
    },

    getCurrentUser: async (): Promise<{ user: User }> => {
        const response = await api.get<{ user: User }>(AUTH_ENDPOINTS.GET_CURRENT_USER);
        return response.data;
    },

    getUserFromStorage: (): User | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },


    isAuthenticated: (): boolean => {
        return (!!localStorage.getItem('accessToken') && !!localStorage.getItem('refreshToken'));
    },
};

export default authService;