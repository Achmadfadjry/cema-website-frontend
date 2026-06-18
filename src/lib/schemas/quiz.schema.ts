import { z } from "zod";
import { DesignStyleEnum, DeleteResponseSchema } from "./common.schema";

// ============================================================
// QUIZ QUESTION SCHEMA
// ============================================================

export const QuizQuestionSchema = z.object({
  _id: z.string(),
  id: z.string(),
  text: z.string(),
  imageUrl: z.string().url().optional(),
  relatedStyle: DesignStyleEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// ============================================================
// REQUEST PAYLOAD SCHEMAS
// ============================================================

export const CreateQuizPayloadSchema = z.object({
  text: z.string().min(5, "Pertanyaan minimal 5 karakter"),
  imageUrl: z.string().url("URL gambar tidak valid").optional(),
  relatedStyle: DesignStyleEnum,
});

export type CreateQuizPayload = z.infer<typeof CreateQuizPayloadSchema>;

export const UpdateQuizPayloadSchema = CreateQuizPayloadSchema.partial();

export type UpdateQuizPayload = z.infer<typeof UpdateQuizPayloadSchema>;

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const QuizListResponseSchema = z.object({
  status: z.literal("success"),
  data: z.array(QuizQuestionSchema),
});

export type QuizListResponse = z.infer<typeof QuizListResponseSchema>;

export const QuizDetailResponseSchema = z.object({
  status: z.literal("success"),
  data: QuizQuestionSchema,
});

export type QuizDetailResponse = z.infer<typeof QuizDetailResponseSchema>;

export const DeleteQuizResponseSchema = DeleteResponseSchema;

export type DeleteQuizResponse = z.infer<typeof DeleteQuizResponseSchema>;
