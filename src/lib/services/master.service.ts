import { ServicesResponseSchema, ServiceItem } from "@/lib/schemas/booking.schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Master Data Service
 * Handles fetching of reference/lookup data like services
 */

export class MasterServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "MasterServiceError";
  }
}

/**
 * Fetch all publicly available services
 * @returns Array of service items
 */
export async function getServices(): Promise<ServiceItem[]> {
  try {
    const response = await fetch(`${API_URL}/services/shown`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new MasterServiceError(
        `Failed to fetch services: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();

    console.log("✅ [MasterService] getServices Response:", data);
    
    // Validate response with Zod
    const parsed = ServicesResponseSchema.safeParse(data);
    
    if (!parsed.success) {
      console.error("❌ [MasterService] Invalid response structure:", parsed.error);
      throw new MasterServiceError("Invalid response structure from services API");
    }

    return parsed.data.data;
  } catch (error) {
    if (error instanceof MasterServiceError) {
      throw error;
    }
    console.error("❌ [MasterService] getServices Error:", error);
    throw new MasterServiceError("Failed to fetch services");
  }
}
