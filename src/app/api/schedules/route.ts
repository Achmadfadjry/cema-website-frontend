import { NextRequest, NextResponse } from "next/server";
import { getBackendToken } from "@/lib/auth-helper";
import { BookingPayloadSchema } from "@/lib/schemas/booking.schema";
import { auth } from "@/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * BFF API Route for Schedules
 * Handles POST /api/schedules
 *
 * This route receives booking/schedule data from the client,
 * attaches the auth token from the httpOnly cookie,
 * and forwards the request to the backend /schedules endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the auth token from the cookie
    const token = await getBackendToken();

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized: Please login first" },
        { status: 401 }
      );
    }

    // Get the booking payload from the request body
    const body = await request.json();

    // Validate the payload
    const validationResult = BookingPayloadSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "❌ [BFF] Invalid booking payload:",
        validationResult.error
      );
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid booking data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const payload = validationResult.data;

    // If clientName is not provided, use the logged-in user's name
    if (!payload.clientName) {
      const session = await auth();
      payload.clientName = session?.user?.name || "Client";
    }

    // Forward to backend API
    const response = await fetch(`${API_URL}/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: data.message || "Failed to create booking",
        },
        { status: response.status }
      );
    }

    // Transform populated fields to string IDs for consistent client-side handling
    if (
      data.data &&
      typeof data.data.project_id === "object" &&
      data.data.project_id !== null
    ) {
      // Extract readable project ID (PROJ-xxx) instead of MongoDB ObjectId
      data.data.project_id =
        data.data.project_id.id || data.data.project_id._id;
    }

    console.log(
      "✅ [BFF] Transformed response:",
      JSON.stringify(data, null, 2)
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ [BFF] Schedules API Error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
