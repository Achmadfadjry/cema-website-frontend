import { z } from "zod";
import {
  ProjectStatusEnum,
  LocationSchema,
  DocumentSchema,
  DeleteResponseSchema,
} from "./common.schema";

// ============================================================
// PROJECT SUB-SCHEMAS
// ============================================================

export const ProjectFinancialsSchema = z.object({
  budget_total: z.number(),
  cost_actual: z.number(),
  value_planned: z.number(),
  value_earned: z.number(),
  cpi: z.number(),
  spi: z.number(),
});

export type ProjectFinancials = z.infer<typeof ProjectFinancialsSchema>;

export const ServiceDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.string(),
});

export type ServiceData = z.infer<typeof ServiceDataSchema>;

// ============================================================
// PROJECT SCHEMA
// ============================================================

export const ProjectSchema = z.object({
  _id: z.string(),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  admin_id: z.string(),
  client_id: z.string(),
  clientName: z.string(),
  manager_id: z.string().optional(),
  managerName: z.string().optional(),
  team_members: z.array(z.string()).optional(),
  status: ProjectStatusEnum,
  serviceType: z.string().optional(),
  serviceName: z.string().optional(),
  serviceData: ServiceDataSchema.optional(),
  location: LocationSchema.optional(),
  progress: z.number().min(0).max(100),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  financials: ProjectFinancialsSchema.optional(),
  documents: z.array(DocumentSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _permissions: z
    .object({
      can_edit: z.boolean(),
      can_delete: z.boolean(),
      can_view_financials: z.boolean(),
    })
    .optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// ============================================================
// REQUEST PAYLOAD SCHEMAS
// ============================================================

export const CreateProjectPayloadSchema = z.object({
  name: z.string().min(1, "Nama proyek diperlukan"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  client_id: z.string().min(1, "Client ID diperlukan"),
  manager_id: z.string().optional(),
  team_members: z.array(z.string()).optional(),
  status: ProjectStatusEnum.default("LEAD"),
  serviceType: z.string().optional(),
  location: LocationSchema.optional(),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  financials: ProjectFinancialsSchema.optional(),
});

export type CreateProjectPayload = z.infer<typeof CreateProjectPayloadSchema>;

export const UpdateProjectPayloadSchema = CreateProjectPayloadSchema.partial();

export type UpdateProjectPayload = z.infer<typeof UpdateProjectPayloadSchema>;

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const ProjectListResponseSchema = z.object({
  status: z.literal("success"),
  total: z.number(),
  data: z.array(ProjectSchema),
});

export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>;

export const ProjectDetailResponseSchema = z.object({
  status: z.literal("success"),
  data: ProjectSchema,
});

export type ProjectDetailResponse = z.infer<typeof ProjectDetailResponseSchema>;

export const DeleteProjectResponseSchema = DeleteResponseSchema;

export type DeleteProjectResponse = z.infer<typeof DeleteProjectResponseSchema>;
