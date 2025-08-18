import { z } from "zod";

// Base email schema with validation
const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required")
  .max(254, "Email is too long");

// Base password schema with strength requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Authentication schemas
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name is too long")
      .regex(/^[a-zA-Zа-яА-Я\s]+$/, "Name can only contain letters and spaces"),
    timezone: z.string().optional(),
    language: z.enum(["en", "ru"]).default("en"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

// OTP (One-time password) schemas for 2FA
export const otpSignInSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const requestOtpSchema = z.object({
  email: emailSchema,
});

// Type exports for TypeScript
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type OtpSignInInput = z.infer<typeof otpSignInSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
