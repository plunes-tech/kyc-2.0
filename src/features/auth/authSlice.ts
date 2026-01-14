import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { ZodError } from 'zod';
import authService from './authService';
import { loginSchema, registerSchema, passwordResetRequestSchema, passwordResetSchema, verifyOtpSchema, changePasswordSchema } from './schema';
import type { AuthState, LoginCredentials, RegisterData, ErrorResponse, AuthResponse, MessageResponse, ResetPasswordPayload, User, OtpPayload, OTPResponse, ChangePasswordResponse, PasswordChangeData } from './types';
import type { RootState } from '../../app/store';

// Initial state
const initialState: AuthState = {
    user: authService.getUserFromStorage(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
    error: null,
    success: false,
    message: '',
};

// Async thunks
export const login = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: ErrorResponse }>('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        // Validate input data with Zod
        const validatedData = loginSchema.parse(credentials);
        return await authService.login(validatedData);
    } catch (error) {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
            return rejectWithValue({
                message: 'Validation error',
                errors: error.errors,
            });
        }

        // Handle API errors
        const err = error as any;
        const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to login';
        return rejectWithValue({ message });
    }
});

export const verifyLoginOtp = createAsyncThunk<OTPResponse, OtpPayload, { rejectValue: ErrorResponse }>('auth/verifyOtp', async (payload, { rejectWithValue }) => {
    try {
        const validateData = verifyOtpSchema.parse(payload)
        return await authService.verifyOtp(validateData)
    } catch (error) {
        if (error instanceof ZodError) {
            return rejectWithValue({
                message: "validation error",
                errors: error.errors,
            })
        }

        const err = error as any;
        const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to login';
        return rejectWithValue({ message });
    }
})

export const resendOtp = createAsyncThunk<OTPResponse, string, { rejectValue: ErrorResponse }>('auth/resendOtp', async (userId, { rejectWithValue }) => {
    try {
        return await authService.resendOtp(userId)
    } catch (error) {
        const err = error as any;
        const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to login';
        return rejectWithValue({ message });
    }
})

export const register = createAsyncThunk<MessageResponse, RegisterData, { rejectValue: ErrorResponse }>('auth/register', async (userData, { rejectWithValue }) => {
    try {
        // Validate input data with Zod
        const validatedData = registerSchema.parse(userData);
        return await authService.register(validatedData);
    } catch (error) {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
            return rejectWithValue({
                message: 'Validation error',
                errors: error.errors,
            });
        }

        // Handle API errors
        const err = error as any;
        const message = err.response?.data?.message || err.message || 'Failed to register';
        return rejectWithValue({ message });
    }
});

export const logout = createAsyncThunk<void, void, { rejectValue: ErrorResponse }>('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await authService.logout();
    } catch (error) {
        const err = error as any;
        const message = err.response?.data?.message || err.message || 'Failed to logout';
        return rejectWithValue({ message });
    }
});

export const requestPasswordReset = createAsyncThunk<MessageResponse, string, { rejectValue: ErrorResponse }>('auth/requestPasswordReset', async (email, { rejectWithValue }) => {
    try {
        // Validate input data with Zod
        const validatedData = passwordResetRequestSchema.parse({ resetEmail: email });
        return await authService.requestPasswordReset(validatedData.resetEmail);
    } catch (error) {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
            return rejectWithValue({
                message: 'Validation error',
                errors: error.errors,
            });
        }

        // Handle API errors
        const err = error as any;
        const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to request password reset';
        return rejectWithValue({ message });
    }
});

export const resetPassword = createAsyncThunk<MessageResponse, ResetPasswordPayload, { rejectValue: ErrorResponse }>('auth/resetPassword', async ({ userId, passwordData }, { rejectWithValue }) => {
    try {
        // Validate input data with Zod
        const validatedData = passwordResetSchema.parse(passwordData);
        return await authService.resetPassword(userId, validatedData);
    } catch (error) {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
            return rejectWithValue({
                message: 'Validation error',
                errors: error.errors,
            });
        }

        // Handle API errors
        const err = error as any;
        const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to reset password';
        return rejectWithValue({ message });
    }
});

export const getCurrentUser = createAsyncThunk<{ user: User }, void, { rejectValue: ErrorResponse }>('auth/getCurrentUser', async (_, { rejectWithValue }) => {
    try {
        return await authService.getCurrentUser();
    } catch (error) {
        const err = error as any;
        const message = err.response?.data?.message || err.message || 'Failed to get user data';
        return rejectWithValue({ message });
    }
});

export const changePasswordThunk = createAsyncThunk<ChangePasswordResponse, PasswordChangeData, { rejectValue: ErrorResponse }>('auth/changePasswordThunk', async (payload, { rejectWithValue }) => {
    try {
        // Validate input data with Zod
        const validatedData = changePasswordSchema.parse(payload);
        return await authService.changePassword(validatedData);
    } catch (error) {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
            return rejectWithValue({
                message: 'Validation error',
                errors: error.errors,
            });
        }

        // Handle API errors
        const err = error as any;
        const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to reset password';
        return rejectWithValue({ message });
    }
});

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.error = null;
            state.success = false;
            state.message = '';
        },
        setCredentials: (state, action: PayloadAction<{ user: User }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = action.payload.message || "OTP sent successfully"
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || { message: 'Failed to login' };
            })

            // validate login OTP
            .addCase(verifyLoginOtp.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(verifyLoginOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.message = action.payload.message || "OTP verified successfully"
                state.user = action.payload.user
                state.success = true;
            })
            .addCase(verifyLoginOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || { message: 'Failed to verify OTP' };
                state.isAuthenticated = false;
                state.user = null;
            })

            // resend otp cases
            .addCase(resendOtp.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(resendOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action.payload.message || "OTP sent successfully"
                state.success = true;
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || { message: 'Failed to send OTP' };
                state.isAuthenticated = false;
                state.user = null;
            })

            // Register cases
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = action.payload.message || 'Registration successful';
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || { message: 'Failed to register' };
            })

            // Logout cases
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })

            // Password reset request cases
            .addCase(requestPasswordReset.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(requestPasswordReset.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = action.payload.message || 'OTP sent to email';
            })
            .addCase(requestPasswordReset.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || { message: 'Failed to request password reset' };
            })

            // Reset password cases
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = action.payload.message || 'Password reset successful';
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || { message: 'Failed to reset password' };
            })

            // change password cases
            .addCase(changePasswordThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(changePasswordThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = action.payload.message || 'Password changed successful';
            })
            .addCase(changePasswordThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || { message: 'Failed to change password' };
            })

            // Get current user cases
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || { message: 'Failed to get user data' };
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const { reset, setCredentials } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthSuccess = (state: RootState) => state.auth.success;
export const selectAuthMessage = (state: RootState) => state.auth.message;

export default authSlice.reducer;