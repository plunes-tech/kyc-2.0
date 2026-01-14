import { z } from 'zod';
import { 
  loginSchema, 
  verifyOtpSchema,
  registerSchema, 
  passwordResetRequestSchema, 
  passwordResetSchema, 
  changePasswordSchema
} from './schema';

export type LoginCredentials = z.infer<typeof loginSchema>;
export type OtpPayload = z.infer<typeof verifyOtpSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type PasswordChangeData = z.infer<typeof changePasswordSchema>;

// User interface
export interface User {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ErrorResponse | null;
  success: boolean;
  message: string;
}

// API response interfaces
export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    userId: string;
    role: string;
    otp: string;
  };
}

export interface OTPResponse {
  success: boolean;
  message?: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    otp: string;
  };
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Error response interface
export interface ErrorResponse {
  message: string;
  errors?: Record<string, string> | unknown;
}

// Password reset interfaces
export interface PasswordResetRequest {
  email: string;
}

export interface ResetPasswordPayload {
  userId: string;
  passwordData: PasswordResetData;
}