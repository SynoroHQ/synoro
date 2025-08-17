import { adminClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), adminClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  emailOtp,
  requestPasswordReset,
  resetPassword,
  changePassword,
} = authClient;
