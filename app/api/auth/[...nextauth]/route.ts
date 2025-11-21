import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// NextAuth route for App Router
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const providers = [] as any[];
if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
} else {
  // Helpful warning in dev when env vars for Google OAuth are missing
  // NextAuth/openid-client will throw a confusing 'client_id is required' error
  // if these are empty — so we avoid registering the provider instead.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      "NextAuth: Google provider skipped because GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set. Set them in .env.local to enable Google Sign-In."
    );
  }
}

const options: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // allow all sign-ins by default; add domain checks if needed
      return true;
    },

    // Persist backend access token into the NextAuth JWT after initial sign-in
    async jwt({ token, account, profile }) {
      // On initial sign in, exchange provider id_token/profile with your backend
      if (account && profile) {
        try {
          // Prefer sending only the provider id_token to your backend so it can
          // verify the token server-side. Backend should expose an endpoint
          // such as POST /auth/google that accepts { idToken }.
          // Use the provider's id_token only. Do NOT fall back to profile.sub
          // — profile.sub is just the Google subject (user id), not a JWT.
          const idToken = (account as any).id_token;

          if (!idToken) {
            // In dev, warn so it's clear why the backend rejects the exchange
            if (process.env.NODE_ENV !== "production") {
              // eslint-disable-next-line no-console
              console.warn("NextAuth jwt: no provider id_token available; skipping backend exchange. Account:", {
                provider: (account as any)?.provider,
                providerAccountId: (account as any)?.providerAccountId,
                profileSub: (profile as any)?.sub,
              });
            }
          }

          // Resolve backend URL from NEXT_PUBLIC_API_URL only so provider
          // exchanges use the same configured backend in all environments.
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";

          // Debug info in dev: where we will send the exchange and a short idToken preview
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.log("NextAuth: exchanging idToken with backend:", backendUrl + "/auth/google", {
              idTokenPreview: idToken ? String(idToken).slice(0, 8) : null,
            });
          }

          // Only attempt the exchange when we have an actual id_token
          let res: Response | null = null;
          if (idToken) {
            res = await fetch(`${backendUrl}/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
            });
          }

          // If no exchange was attempted (no idToken), skip processing.
          if (!res) return token;

          // Read response body (text) for robust logging even when invalid JSON
          const raw = await res.text().catch(() => "");
          let data: any = null;
          try {
            data = raw ? JSON.parse(raw) : null;
          } catch (parseErr) {
            // preserve raw body for debugging
            data = { _raw: raw };
          }

          if (res.ok) {
            // Expect backend to return { accessToken, user }
            if (data?.accessToken) {
              token.accessToken = data.accessToken;
            } else {
              // Log explicit warning if backend didn't provide accessToken
              // eslint-disable-next-line no-console
              console.warn("NextAuth jwt: backend returned 200 but no accessToken", { status: res.status, body: data });
            }
            if (data?.user) token.user = data.user;
            // If backend returned an expiration hint, persist it on the
            // NextAuth JWT so the client can persist the token with the
            // same expiration behavior as the email/password login flow.
            // Backend may return `expiresIn` (seconds) or `expiresAt` (ISO).
            if (data?.expiresIn) {
              try {
                // store as absolute ms timestamp
                token.accessTokenExpires = Date.now() + Number(data.expiresIn) * 1000;
              } catch (e) {
                // ignore
              }
            } else if (data?.expiresAt) {
              try {
                token.accessTokenExpires = Date.parse(String(data.expiresAt));
              } catch (e) {
                // ignore
              }
            }
          } else {
            // log but don't block sign-in — include status and parsed/raw body
            // eslint-disable-next-line no-console
            console.error("NextAuth jwt: backend exchange failed", { status: res.status, body: data });
          }
        } catch (err) {
          console.error("Error exchanging oauth token with backend", err);
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Expose backend access token on session for client use
      (session as any).accessToken = (token as any).accessToken;
      // Expose backend-provided access token expiry (ms timestamp) if present
      if ((token as any).accessTokenExpires) {
        (session as any).accessTokenExpires = (token as any).accessTokenExpires;
      }
      if ((token as any).user) session.user = (token as any).user;
      return session;
    },
  },
};

const handler = NextAuth(options);
export { handler as GET, handler as POST };
