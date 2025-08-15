export { default as EmailChangeVerification } from "./emails/auth/email-change-verification";
export { default as EmailVerification } from "./emails/auth/email-verification";
export { default as OtpSignInEmail } from "./emails/auth/otp-sign-in";
export { default as PasswordResetEmail } from "./emails/auth/password-reset";
export { default as WelcomeEmail } from "./emails/welcome";

// Экспортируем утилиты для перевода
export * from "./src/utils";

export { sendEmail, sendEmailHtml } from "./send";
// env was moved to @synoro/config to respect layered architecture
