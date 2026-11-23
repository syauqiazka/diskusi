import { createAuthClient } from "better-auth/react";

// Biarkan Better Auth memakai origin browser saat ini.
// Jangan fallback ke localhost:3000 karena pada deployment produksi
// permintaan sign-in/sign-up bisa salah diarahkan ke localhost milik pengguna.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
