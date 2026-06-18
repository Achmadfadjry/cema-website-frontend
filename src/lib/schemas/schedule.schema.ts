import { z } from "zod";
import {
  ScheduleStatusEnum,
  LocationSchema,
  DeleteResponseSchema,
} from "./common.schema";

// ============================================================
// SCHEDULE SCHEMA
// ============================================================

export const ScheduleSchema = z.object({
  _id: z.string(),
  id: z.string(),
  client_id: z.string(),
  manager_id: z.string().optional(),
  project_id: z.string(),
  date: z.string(), // ISO date string
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
  event: z.string(),
  description: z.string().optional(),
  isOnline: z.boolean(),
  location: LocationSchema.optional(),
  link: z.url().optional(),
  status: ScheduleStatusEnum.default("UPCOMING"),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Schedule = z.infer<typeof ScheduleSchema>;

// ============================================================
// POLYMORPHIC BOOKING PAYLOAD SCHEMAS
// ============================================================

// Scenario A: Add schedule to existing project
export const ExistingProjectBookingSchema = z.object({
  booking_type: z.literal("EXISTING"),
  project_id: z.string().min(1, "Project ID diperlukan"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
  event: z.string().min(1, "Nama event diperlukan"),
  isOnline: z.boolean(),
  location: LocationSchema.optional(),
  link: z.url("URL link tidak valid").optional(),
});

export type ExistingProjectBooking = z.infer<
  typeof ExistingProjectBookingSchema
>;

// Scenario B: Create new project + schedule (transaction)
export const NewProjectBookingSchema = z.object({
  booking_type: z.literal("NEW"),
  clientName: z.string().optional(),
  serviceType: z.string().min(1, "Service ID diperlukan"),
  projectDescription: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
  event: z.string().default("Initial Consultation"),
  isOnline: z.boolean(),
  location: LocationSchema.optional(),
  link: z.url("URL link tidak valid").optional(),
});

export type NewProjectBooking = z.infer<typeof NewProjectBookingSchema>;

// Discriminated union for polymorphic booking
export const BookingPayloadSchema = z.discriminatedUnion("booking_type", [
  ExistingProjectBookingSchema,
  NewProjectBookingSchema,
]);

export type BookingPayload = z.infer<typeof BookingPayloadSchema>;

// ============================================================
// UPDATE SCHEDULE PAYLOAD
// ============================================================

export const UpdateSchedulePayloadSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .optional(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM")
    .optional(),
  event: z.string().optional(),
  description: z.string().optional(),
  isOnline: z.boolean().optional(),
  location: LocationSchema.optional(),
  link: z.url("URL link tidak valid").optional(),
  status: ScheduleStatusEnum.optional(),
});

export type UpdateSchedulePayload = z.infer<typeof UpdateSchedulePayloadSchema>;

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const ScheduleListResponseSchema = z.object({
  status: z.literal("success"),
  data: z.array(ScheduleSchema),
});

export type ScheduleListResponse = z.infer<typeof ScheduleListResponseSchema>;

export const ScheduleDetailResponseSchema = z.object({
  status: z.literal("success"),
  data: ScheduleSchema,
});

export type ScheduleDetailResponse = z.infer<
  typeof ScheduleDetailResponseSchema
>;

// Response for creating a schedule (can include newly created project)
// The backend returns the schedule directly in the data field
// Note: BFF layer transforms populated project_id to string ID
export const CreateScheduleResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string().optional(),
  data: z.object({
    _id: z.string(),
    id: z.string().optional(),
    client_id: z.string().optional(),
    manager_id: z.string().optional(),
    project_id: z.string().optional(),
    event: z.string(),
    date: z.string(),
    time: z.string(),
    isOnline: z.boolean(),
    location: LocationSchema.nullable().optional(),
    link: z.string().nullable().optional(),
    status: ScheduleStatusEnum.optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    __v: z.number().optional(),
  }),
});

export type CreateScheduleResponse = z.infer<
  typeof CreateScheduleResponseSchema
>;

export const DeleteScheduleResponseSchema = DeleteResponseSchema;

export type DeleteScheduleResponse = z.infer<
  typeof DeleteScheduleResponseSchema
>;
