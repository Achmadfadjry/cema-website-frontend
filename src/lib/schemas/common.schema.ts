import { z } from "zod";

// ============================================================
// COMMON ENUMS
// ============================================================

export const UserRoleEnum = z.enum([
  "client",
  "admin",
  "project_manager",
  "staff",
]);

export type UserRole = z.infer<typeof UserRoleEnum>;

export const ProjectStatusEnum = z.enum([
  "LEAD",
  "DESIGN",
  "CONSTRUCTION",
  "RETENTION",
  "COMPLETED",
  "CANCELLED",
]);

export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

export const TaskStatusEnum = z.enum([
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
]);

export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const ScheduleStatusEnum = z.enum([
  "UPCOMING",
  "COMPLETED",
  "CANCELLED",
]);

export type ScheduleStatus = z.infer<typeof ScheduleStatusEnum>;

export const DocumentTypeEnum = z.enum(["CONTRACT", "BLUEPRINT", "INVOICE"]);

export type DocumentType = z.infer<typeof DocumentTypeEnum>;

export const AttachmentTypeEnum = z.enum(["FILE", "IMAGE", "LINK"]);

export type AttachmentType = z.infer<typeof AttachmentTypeEnum>;

export const DesignStyleEnum = z.enum([
  "MODERN",
  "MINIMALIST",
  "INDUSTRIAL",
  "SCANDINAVIAN",
  "JAPANDI",
  "CLASSIC",
  "CONTEMPORARY",
  "RUSTIC",
]);

export type DesignStyle = z.infer<typeof DesignStyleEnum>;

// ============================================================
// COMMON OBJECT SCHEMAS
// ============================================================

export const CoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;

export const LocationSchema = z.object({
  address: z.string(),
  coordinates: CoordinatesSchema.optional(),
});

export type Location = z.infer<typeof LocationSchema>;

export const DocumentSchema = z.object({
  title: z.string(),
  url: z.string(),
  type: DocumentTypeEnum,
  uploaded_at: z.string(),
});

export type Document = z.infer<typeof DocumentSchema>;

export const AttachmentSchema = z.object({
  type: AttachmentTypeEnum,
  url: z.string(),
  name: z.string(),
  uploaded_at: z.string(),
});

export type Attachment = z.infer<typeof AttachmentSchema>;

// ============================================================
// COMMON API RESPONSE WRAPPERS
// ============================================================

export const SuccessResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string().optional(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

export const OkResponseSchema = z.object({
  status: z.literal("ok"),
  message: z.string().optional(),
});

export type OkResponse = z.infer<typeof OkResponseSchema>;

export const DeleteResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
});

export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;
