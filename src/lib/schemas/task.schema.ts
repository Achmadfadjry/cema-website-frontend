import { z } from "zod";
import {
  TaskStatusEnum,
  AttachmentSchema,
  DeleteResponseSchema,
} from "./common.schema";

// ============================================================
// TASK SUB-SCHEMAS
// ============================================================

export const TaskApprovalSchema = z.object({
  is_approved: z.boolean(),
  approved_by: z.string().optional(),
  rejection_note: z.string().optional(),
  approved_at: z.string().optional(),
});

export type TaskApproval = z.infer<typeof TaskApprovalSchema>;

// ============================================================
// TASK SCHEMA
// ============================================================

export const TaskSchema = z.object({
  _id: z.string(),
  id: z.string(),
  project_id: z.string(),
  assigned_to: z.array(z.string()).optional(),
  created_by: z.string(),
  title: z.string(),
  description: z.string(),
  budget_allocation: z.number().optional(),
  due_date: z.string().optional(),
  status: TaskStatusEnum,
  attachments: z.array(AttachmentSchema).optional(),
  is_punch_item: z.boolean().default(false),
  approval: TaskApprovalSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Task = z.infer<typeof TaskSchema>;

// ============================================================
// REQUEST PAYLOAD SCHEMAS
// ============================================================

export const CreateTaskPayloadSchema = z.object({
  project_id: z.string().min(1, "Project ID diperlukan"),
  title: z.string().min(1, "Judul tugas diperlukan"),
  description: z.string().min(1, "Deskripsi diperlukan"),
  assigned_to: z.array(z.string()).optional(),
  budget_allocation: z
    .number()
    .min(0, "Alokasi anggaran harus positif")
    .optional(),
  due_date: z.string().optional(),
  status: TaskStatusEnum.default("TODO"),
  is_punch_item: z.boolean().default(false),
});

export type CreateTaskPayload = z.infer<typeof CreateTaskPayloadSchema>;

export const UpdateTaskPayloadSchema = CreateTaskPayloadSchema.partial().extend(
  {
    attachments: z.array(AttachmentSchema).optional(),
    approval: TaskApprovalSchema.optional(),
  }
);

export type UpdateTaskPayload = z.infer<typeof UpdateTaskPayloadSchema>;

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const TaskListResponseSchema = z.object({
  status: z.literal("success"),
  total: z.number(),
  data: z.array(TaskSchema),
});

export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;

export const TaskDetailResponseSchema = z.object({
  status: z.literal("success"),
  data: TaskSchema,
});

export type TaskDetailResponse = z.infer<typeof TaskDetailResponseSchema>;

export const DeleteTaskResponseSchema = DeleteResponseSchema;

export type DeleteTaskResponse = z.infer<typeof DeleteTaskResponseSchema>;
