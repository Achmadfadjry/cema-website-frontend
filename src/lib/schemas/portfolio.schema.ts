import { z } from "zod";
import { DeleteResponseSchema } from "./common.schema";

// ============================================================
// PORTFOLIO SCHEMA
// ============================================================

export const PortfolioSchema = z.object({
  _id: z.string(),
  id: z.string(),
  displayName: z.string(),
  category: z.string(),
  description: z.string(),
  endDate: z.string(),
  photoUrl: z.string().url(),
  isShown: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

// ============================================================
// REQUEST PAYLOAD SCHEMAS
// ============================================================

export const CreatePortfolioPayloadSchema = z.object({
  displayName: z.string().min(1, "Nama portfolio diperlukan"),
  category: z.string().min(1, "Kategori diperlukan"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  endDate: z.string(),
  photoUrl: z.string().url("URL foto tidak valid"),
  isShown: z.boolean().default(true),
});

export type CreatePortfolioPayload = z.infer<
  typeof CreatePortfolioPayloadSchema
>;

export const UpdatePortfolioPayloadSchema =
  CreatePortfolioPayloadSchema.partial();

export type UpdatePortfolioPayload = z.infer<
  typeof UpdatePortfolioPayloadSchema
>;

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const PortfolioListResponseSchema = z.object({
  status: z.literal("success"),
  total: z.number(),
  data: z.array(PortfolioSchema),
});

export type PortfolioListResponse = z.infer<typeof PortfolioListResponseSchema>;

export const PortfolioDetailResponseSchema = z.object({
  status: z.literal("success"),
  data: PortfolioSchema,
});

export type PortfolioDetailResponse = z.infer<
  typeof PortfolioDetailResponseSchema
>;

export const DeletePortfolioResponseSchema = DeleteResponseSchema;

export type DeletePortfolioResponse = z.infer<
  typeof DeletePortfolioResponseSchema
>;
