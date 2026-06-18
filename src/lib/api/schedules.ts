import { auth } from "@/auth";
import { getBackendToken } from "@/lib/auth-helper";
import type { Schedule, ScheduleStatus } from "@/lib/types";

// Backend Schedule Interface
interface BackendSchedule {
  _id: string;
  id?: string;
  client_id: string;
  manager_id: string;
  project_id: string;
  date: string;
  time: string;
  event: string;
  description: string;
  isOnline?: boolean;
  location?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  link?: string;
  status: string; // "UPCOMING" | "DONE" | "CANCELLED"
  created_at?: string;
  updated_at?: string;
}

export async function getSchedules(): Promise<Schedule[]> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const token = await getBackendToken();

  if (!token) {
    throw new Error("Unauthorized: No backend token");
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedules`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
        // Log access denied or other errors but don't crash app if empty
        if (response.status === 403) {
            console.warn("⚠️ [API] Access Denied to /schedules. Returning empty list.");
            return [];
        }
        throw new Error(`Failed to fetch schedules: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success" && Array.isArray(data.data)) {
      return data.data.map((item: BackendSchedule) => mapBackendToFrontend(item));
    }

    return [];
  } catch (error) {
    console.error("❌ getSchedules Error:", error);
    return [];
  }
}

function mapBackendToFrontend(backendItem: BackendSchedule): Schedule {
    let mappedStatus: ScheduleStatus = 'scheduled';
    
    switch (backendItem.status?.toUpperCase()) {
        case 'DONE':
            mappedStatus = 'done';
            break;
        case 'CANCELLED':
            mappedStatus = 'cancelled';
            break;
        case 'UPCOMING':
        default:
            mappedStatus = 'scheduled';
            break;
    }

    return {
        id: backendItem.id || backendItem._id,
        userId: backendItem.client_id,
        projectId: backendItem.project_id,
        date: backendItem.date ? new Date(backendItem.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: backendItem.time,
        event: backendItem.event,
        description: backendItem.description,
        status: mappedStatus,
        isOnline: backendItem.isOnline,
        location: backendItem.location,
        link: backendItem.link,
        createdAt: backendItem.created_at ? new Date(backendItem.created_at) : undefined
    };
}
