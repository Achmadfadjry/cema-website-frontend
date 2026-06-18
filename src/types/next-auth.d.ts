import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extended user session to include role and profilePicture
   */
  interface Session {
    user: {
      id: string;
      role: string;
      profilePicture?: string;
    } & DefaultSession["user"];
  }

  /**
   * Extended user object from authorize callback
   */
  interface User {
    id: string;
    name?: string;
    email: string;
    role: string;
    profilePicture?: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT to store backend access token securely
   */
  interface JWT {
    id: string;
    role: string;
    profilePicture?: string;
    accessToken: string;
  }
}
