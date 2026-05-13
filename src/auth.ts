import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

declare module "next-auth" {
  interface User {
    role: string;
    accessToken: string;
    profilePicture?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      accessToken: string;
      profilePicture?: string;
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
    profilePicture?: string;
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        idToken: { label: "Firebase Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          let endpoint = "";
          let body = {};

          if (credentials?.idToken) {
            endpoint = `${BACKEND_API_URL}/google-login`;
            body = { idToken: credentials.idToken };
          } else {
            const validatedFields = loginSchema.safeParse(credentials);
            if (!validatedFields.success) return null;

            endpoint = `${BACKEND_API_URL}/login`;
            body = validatedFields.data;
          }

          console.log("🔵 Calling backend:", endpoint);

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          // Ambil response sebagai JSON
          const result = await response.json();
          console.log("🔵 Backend response:", JSON.stringify(result, null, 2));

          if (!response.ok) {
            console.error("❌ Response not OK:", result.message);
            return null;
          }

          // SESUAIKAN DENGAN STRUKTUR BACKEND: result.status & result.data
          if (result.status === "success" && result.data) {
            const { user, token } = result.data;

            return {
              id: user._id, // Ambil dari user._id sesuai log backend
              name: user.name || user.email,
              email: user.email,
              role: user.role,
              profilePicture: user.profilePicture || null,
              accessToken: token, // Ambil token dari result.data.token
            };
          }

          return null;
        } catch (error) {
          console.error("❌ Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as string;
        token.profilePicture = user.profilePicture as string;
        token.accessToken = user.accessToken as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.profilePicture = token.profilePicture;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
