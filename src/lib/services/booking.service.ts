import {
  BookingPayload,
  BookingResponse,
  BookingResponseSchema,
  BookingFormData,
  toBookingPayload,
} from "@/lib/schemas/booking.schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Booking Service
 * Client-side service that calls the BFF endpoint
 *
 * NOTE: Since we use BFF pattern with httpOnly cookies,
 * actual API calls must go through Server Actions.
 * This file provides the interface for the hook.
 */

export class BookingServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "BookingServiceError";
  }
}

/**
 * Create a new booking via BFF endpoint
 * This calls the Next.js API route which handles auth
 *
 * @param formData - Form data from booking page
 * @returns Booking response
 */
export async function createBookingFromForm(
  formData: BookingFormData
): Promise<BookingResponse> {
  const payload = toBookingPayload(formData);

  try {
    // Call Next.js API route (BFF pattern)
    const response = await fetch("/api/schedules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new BookingServiceError(
        errorData.message || `Failed to create booking: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();

    console.log(
      "📦 [BookingService] Received response:",
      JSON.stringify(data, null, 2)
    );

    // Validate response
    const parsed = BookingResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error(
        "❌ [BookingService] Invalid booking response:",
        parsed.error
      );
      throw new BookingServiceError("Invalid response from booking API");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    console.error("❌ [BookingService] createBooking Error:", error);
    throw new BookingServiceError("Failed to create booking");
  }
}
