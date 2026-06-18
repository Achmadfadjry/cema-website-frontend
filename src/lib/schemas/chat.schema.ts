import { z } from "zod";

// ============================================================
// REQUEST PAYLOAD SCHEMAS
// ============================================================

export const SendMessagePayloadSchema = z.object({
  message: z.string().min(1, "Pesan tidak boleh kosong"),
  userId: z.string().optional(),
});

export type SendMessagePayload = z.infer<typeof SendMessagePayloadSchema>;

export const ReplyMessagePayloadSchema = z.object({
  userId: z.string().min(1, "User ID diperlukan"),
  message: z.string().min(1, "Balasan tidak boleh kosong"),
});

export type ReplyMessagePayload = z.infer<typeof ReplyMessagePayloadSchema>;

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const ChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export const ResetUnreadResponseSchema = z.object({
  success: z.boolean(),
});

export type ResetUnreadResponse = z.infer<typeof ResetUnreadResponseSchema>;
