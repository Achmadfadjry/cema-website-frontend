import { z } from "zod";

// ============================================================
// SERVICE SCHEMA
// ============================================================

export const ServiceSchema = z.object({
  _id: z.string(),
  title: z.string(),
  category: z.string().optional(),
  price: z.string(),
  image: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  isPopular: z.boolean().optional(),
  isShown: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Service = z.infer<typeof ServiceSchema>;

// ============================================================
// REQUEST PAYLOAD SCHEMAS
// ============================================================

export const CreateServicePayloadSchema = z.object({
  title: z.string().min(1, "Judul layanan diperlukan"),
  category: z.string().optional(),
  price: z.string().min(1, "Harga diperlukan"),
  image: z.string().url("URL gambar tidak valid").optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  isPopular: z.boolean().default(false),
  isShown: z.boolean().default(true),
});

export type CreateServicePayload = z.infer<typeof CreateServicePayloadSchema>;

export const UpdateServicePayloadSchema = CreateServicePayloadSchema.partial();

export type UpdateServicePayload = z.infer<typeof UpdateServicePayloadSchema>;

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const ServiceListResponseSchema = z.object({
  status: z.literal("ok"),
  data: z.array(ServiceSchema),
});

export type ServiceListResponse = z.infer<typeof ServiceListResponseSchema>;

export const ServiceDetailResponseSchema = z.object({
  status: z.literal("ok"),
  data: ServiceSchema,
});

export type ServiceDetailResponse = z.infer<typeof ServiceDetailResponseSchema>;

export const DeleteServiceResponseSchema = z.object({
  status: z.literal("ok"),
  message: z.string(),
});

export type DeleteServiceResponse = z.infer<typeof DeleteServiceResponseSchema>;
