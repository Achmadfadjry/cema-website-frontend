import { auth } from "@/auth";
import { getBackendToken } from "@/lib/auth-helper";

export interface Project {
  _id: string; // Backend uses _id
  id?: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  location: {
    address: string;
  };
  startDate?: string;
  endDate?: string;
  // Dynamic permissions field (to be discovered)
  [key: string]: any;
}

export async function getMyProjects(): Promise<Project[]> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // SECURE BFF PATTERN: Retrieve token from cookie, not session
  const token = await getBackendToken();
  
  if (!token) {
    console.error("❌ [API] Failed to retrieve backend token from cookies");
    throw new Error("Unauthorized: No backend token");
  }


  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`Failed to fetch projects: ${response.status}`);
    }

    const data = await response.json();
    
    // --- DISCOVERY LOGGING ---
    console.log("🔵 [DISCOVERY] Raw Project Response:", JSON.stringify(data, null, 2));

    if (data.status === "success" && Array.isArray(data.data)) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error("❌ getMyProjects Error:", error);
    throw error;
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const token = await getBackendToken();
  
  if (!token) {
    throw new Error("Unauthorized: No backend token");
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === "success" && data.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error("❌ getProjectById Error:", error);
    throw error;
  }
}
