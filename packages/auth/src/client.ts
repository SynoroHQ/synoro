import { adminClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getBaseUrl } from "./util";

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
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
