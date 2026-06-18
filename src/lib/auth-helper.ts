import { getToken } from "next-auth/jwt";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";

/**
 * Retrieves the Backend Access Token securely from the encrypted NextAuth cookie.
 * This function is for SERVER-SIDE use only (Server Components & Server Actions).
 * 
 * It bypasses the 'session' object (which has the token stripped) and reads
 * directly from the HTTP-only cookie.
 */
export async function getBackendToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const headersList = await headers();

  // Construct a partial request object compatible with getToken
  // getToken relies on 'headers' or 'cookies' to find the auth token
  const req = {
    headers: Object.fromEntries(headersList),
    cookies: Object.fromEntries(
      cookieStore.getAll().map((c) => [c.name, c.value])
    ),
  } as any;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });

  return token?.accessToken as string || null;
}
