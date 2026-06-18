import { z } from "zod";
import { UserRoleEnum } from "./common.schema";

// ============================================================
// USER SCHEMA
// ============================================================

export const UserSchema = z.object({
  _id: z.string(),
  email: z.email(),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  profilePicture: z.string().optional(),
  role: UserRoleEnum,
  createdAt: z.string().optional(),
  googleId: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// ============================================================
// REQUEST PAYLOAD SCHEMAS
// ============================================================

export const LoginPayloadSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export const RegisterPayloadSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phoneNumber: z.string().min(10, "Nomor telepon minimal 10 digit").optional(),
  role: UserRoleEnum.default("client"),
});

export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;

export const GoogleLoginPayloadSchema = z.object({
  idToken: z.string().min(1, "ID token diperlukan"),
});

export type GoogleLoginPayload = z.infer<typeof GoogleLoginPayloadSchema>;

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const RegisterResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z.object({
    user: z.object({
      _id: z.string(),
      name: z.string(),
      phoneNumber: z.string().optional(),
      email: z.email(),
      role: UserRoleEnum,
    }),
  }),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const LoginResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z.object({
    user: UserSchema,
    token: z.string(),
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const GoogleLoginResponseSchema = LoginResponseSchema;
export type GoogleLoginResponse = LoginResponse;

export const RefreshTokenResponseSchema = z.object({
  status: z.literal("ok"),
  message: z.string(),
  token: z.string(),
});

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
