import { z } from "zod";
import { UserRoleEnum, DeleteResponseSchema } from "./common.schema";
import { UserSchema } from "./auth.schema";

// ============================================================
// RE-EXPORT USER SCHEMA FROM AUTH
// ============================================================

export { UserSchema } from "./auth.schema";
export type { User } from "./auth.schema";

// ============================================================
// REQUEST PAYLOAD SCHEMAS
// ============================================================

export const CreateUserPayloadSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phoneNumber: z.string().min(10, "Nomor telepon minimal 10 digit").optional(),
  role: UserRoleEnum.default("client"),
  profilePicture: z.string().url("URL gambar tidak valid").optional(),
});

export type CreateUserPayload = z.infer<typeof CreateUserPayloadSchema>;

export const UpdateUserPayloadSchema = CreateUserPayloadSchema.partial().omit({
  password: true,
});

export type UpdateUserPayload = z.infer<typeof UpdateUserPayloadSchema>;

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const UserListResponseSchema = z.object({
  status: z.literal("success"),
  total: z.number(),
  data: z.array(
    z.object({
      _id: z.string(),
      email: z.string().email(),
      name: z.string(),
      role: z.string(),
    })
  ),
});

export type UserListResponse = z.infer<typeof UserListResponseSchema>;

export const UserDetailResponseSchema = z.object({
  status: z.literal("success"),
  data: UserSchema,
});

export type UserDetailResponse = z.infer<typeof UserDetailResponseSchema>;

export const DeleteUserResponseSchema = DeleteResponseSchema;

export type DeleteUserResponse = z.infer<typeof DeleteUserResponseSchema>;
