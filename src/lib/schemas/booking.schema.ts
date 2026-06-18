import { z } from "zod";
import { NewProjectBookingSchema } from "./schedule.schema";

// ============================================================
// RE-EXPORT SERVICE SCHEMAS FOR BACKWARD COMPATIBILITY
// ============================================================

export {
  ServiceSchema as ServiceItemSchema,
  ServiceListResponseSchema as ServicesResponseSchema,
} from "./service.schema";
export type {
  Service as ServiceItem,
  ServiceListResponse as ServicesResponse,
} from "./service.schema";

// ============================================================
// RE-EXPORT AUTH SCHEMAS FOR BACKWARD COMPATIBILITY
// ============================================================

export { LoginPayloadSchema, RegisterPayloadSchema } from "./auth.schema";
export type { LoginPayload, RegisterPayload } from "./auth.schema";

// ============================================================
// BOOKING SCHEMAS
// ============================================================

// Input schema for form data (client-side)
export const BookingFormDataSchema = z.object({
  serviceId: z.string().min(1, "Pilih layanan"),
  serviceTitle: z.string(),
  servicePrice: z.string().optional(),
  projectDescription: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu tidak valid"),
  method: z.enum(["online", "offline"]),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
});

export type BookingFormData = z.infer<typeof BookingFormDataSchema>;

// Payload schema for API request (use NewProjectBookingSchema from schedule.schema.ts)
export const BookingPayloadSchema = NewProjectBookingSchema;

export type BookingPayload = z.infer<typeof BookingPayloadSchema>;

// Re-export from schedule schema
export { CreateScheduleResponseSchema as BookingResponseSchema } from "./schedule.schema";
export type { CreateScheduleResponse as BookingResponse } from "./schedule.schema";

// ============================================================
// ADAPTER FUNCTIONS
// ============================================================

/**
 * Transforms form data to API payload
 */
export function toBookingPayload(formData: BookingFormData): BookingPayload {
  return {
    booking_type: "NEW",
    serviceType: formData.serviceId,
    clientName: formData.clientName,
    projectDescription: formData.projectDescription,
    date: formData.date,
    time: formData.time,
    event: "Consultation",
    isOnline: formData.method === "online",
  };
}
