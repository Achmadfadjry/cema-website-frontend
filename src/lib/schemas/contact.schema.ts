import { z } from "zod";

// ============================================================
// REQUEST PAYLOAD SCHEMA
// ============================================================

export const ContactPayloadSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit").optional(),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;

// ============================================================
// RESPONSE SCHEMA
// ============================================================

export const ContactResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
});

export type ContactResponse = z.infer<typeof ContactResponseSchema>;
