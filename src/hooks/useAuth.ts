import { useDispatch, useSelector } from "react-redux";
import { login, register, logout, requestPasswordReset, resetPassword, getCurrentUser, reset, selectCurrentUser, selectIsAuthenticated, selectAuthLoading, selectAuthError, selectAuthSuccess, selectAuthMessage, verifyLoginOtp, resendOtp, changePasswordThunk } from "../features/auth/authSlice";
import type { LoginCredentials, RegisterData, PasswordResetData, AuthResponse, MessageResponse, OtpPayload, OTPResponse, PasswordChangeData, ChangePasswordResponse } from "../features/auth/types";
import type { AppDispatch } from "../app/store";

const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);
    const success = useSelector(selectAuthSuccess);
    const message = useSelector(selectAuthMessage);

    const handleLogin = async (
        credentials: LoginCredentials
    ): Promise<AuthResponse> => {
        try {
            const result = await dispatch(login(credentials)).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const handleVerifyOtp = async (payload: OtpPayload): Promise<OTPResponse> => {
        try {
            const result = await dispatch(verifyLoginOtp(payload)).unwrap();
            return result
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const handleResenOtp = async (userId: string): Promise<OTPResponse> => {
        try {
            const result = await dispatch(resendOtp(userId)).unwrap()
            return result
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const handleRegister = async (
        userData: RegisterData
    ): Promise<MessageResponse> => {
        try {
            const result = await dispatch(register(userData)).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const handleLogout = async (): Promise<void> => {
        await dispatch(logout());
        window.location.href = "/login"
    };

    const handlePasswordResetRequest = async (
        email: string
    ): Promise<MessageResponse> => {
        try {
            const result = await dispatch(requestPasswordReset(email)).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const handleResetPassword = async (
        userId: string,
        passwordData: PasswordResetData
    ): Promise<MessageResponse> => {
        try {
            const result = await dispatch(
                resetPassword({ userId, passwordData })
            ).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    // reset passowrd
    const handleChangePassword = async (payload: PasswordChangeData): Promise<ChangePasswordResponse> => {
        try {
            const result = await dispatch(changePasswordThunk(payload)).unwrap();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const fetchCurrentUser = async (): Promise<void> => {
        try {
            await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };

    const resetAuthState = (): void => {
        dispatch(reset());
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        success,
        message,
        login: handleLogin,
        verifyOtp: handleVerifyOtp,
        resendOtp: handleResenOtp,
        register: handleRegister,
        logout: handleLogout,
        requestPasswordReset: handlePasswordResetRequest,
        changePassword: handleChangePassword,
        resetPassword: handleResetPassword,
        getCurrentUser: fetchCurrentUser,
        resetAuthState,
    };
};

export default useAuth;