import {
  LoginPayload,
  RegisterPayload,
  LoginResponseSchema,
  LoginResponse,
  RegisterResponseSchema,
  RegisterResponse,
} from "@/lib/schemas/auth.schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Authentication Service
 * Handles login and registration
 */

export class AuthServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "AuthServiceError";
  }
}

/**
 * Login user with email and password
 * @param credentials - Login payload
 * @returns Auth response with user and token
 */
export async function login(credentials: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AuthServiceError(
        errorData.message || `Login failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();

    // Validate response
    const parsed = LoginResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error("❌ [AuthService] Invalid login response:", parsed.error);
      throw new AuthServiceError("Invalid response from login API");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    console.error("❌ [AuthService] login Error:", error);
    throw new AuthServiceError("Login failed");
  }
}

/**
 * Register a new user
 * @param userData - Registration payload
 * @returns Auth response with user and token
 */
export async function register(
  userData: RegisterPayload
): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userData,
        role: userData.role || "client",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AuthServiceError(
        errorData.message || `Registration failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();

    // Validate response
    const parsed = RegisterResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error(
        "❌ [AuthService] Invalid register response:",
        parsed.error
      );
      throw new AuthServiceError("Invalid response from register API");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    console.error("❌ [AuthService] register Error:", error);
    throw new AuthServiceError("Registration failed");
  }
}
