import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email({ message: "Please provide a valid email address" })
    .max(50, "Email address must not exceed 50 characters."),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must contain at least 8 characters")
    .max(30, "Password must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9!@#$%^&*()]+$/, {
      message: "Password can only contain letters, numbers, and these special characters: !@#$%^&*()",
    }),
});

export const verifyOtpSchema = z.object({
  userId: z
    .string()
    .nonempty("User ID is required"),
  otp: z
    .string()
    .nonempty("OTP is required.")
    .max(6, "OTP must not exceed 6 characters"),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Please confirm your password' })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const passwordResetRequestSchema = z.object({
  resetEmail: z
    .string({message: "Email is required for resetting the password"})
    .nonempty({message: "Email is required for resetting the password"})
    .email({ message: "Please provide a valid email address" })
    .max(50, "Email address must not exceed 50 characters."),
})

export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/^[a-zA-Z0-9!@#$%^&*()]+$/, {
      message: "Password can only contain letters, numbers, and these special characters: !@#$%^&*()",
    }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Please confirm your password' })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword', "resetPassword"]
});

export const changePasswordSchema = z.object({
	oldPassword: z
		.string()
		.nonempty("Please enter your old password"),
	newPassword: z
		.string()
		.nonempty("Please enter your new password")
		.min(8, "Your new password must contain at least 8 characters")
		.max(30, "Your new password must not exceed 30 characters")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,30}$/,
			{
				message:
					`Your new password must include at least one uppercase letter, 
          			one lowercase letter, one number, and one special character (!@#$%^&*())`,
			}
		),
	confirmPassword: z
		.string()
		.nonempty("Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: "New passowrd and confirm password did not match",
	path: ["confirmPassword"],
});