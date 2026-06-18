"use server";

import { getBackendToken } from "@/lib/auth-helper";

interface Project {
    _id: string;
    id: string;
    name: string;
    clientName: string;
    status: string;
    progress: number;
}

interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

/**
 * Fetches all projects from the backend API
 * @returns ActionResponse with projects array or error message
 */
export async function fetchProjectsAction(): Promise<ActionResponse<Project[]>> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (res.status === 401) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const result = await res.json();

        if (result.status === "success") {
            return {
                success: true,
                data: result.data,
            };
        } else {
            return {
                success: false,
                message: result.message || "Gagal memuat data project",
            };
        }
    } catch (error) {
        console.error("Fetch projects error:", error);
        return {
            success: false,
            message: "Gagal load data",
        };
    }
}

/**
 * Updates a project's status or progress
 * @param projectId - Project ID
 * @param payload - Data to update (status or progress)
 * @returns ActionResponse with success status
 */
export async function updateProjectAction(
    projectId: string,
    payload: { status?: string; progress?: number }
): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }
        );

        const result = await res.json();

        if (res.ok) {
            return {
                success: true,
                message: "Update Berhasil!",
            };
        } else {
            console.error("DEBUG BACKEND ERROR:", {
                status: res.status,
                response: result,
                projectIdSent: projectId,
            });
            return {
                success: false,
                message: result.error || result.message || "Gagal update",
            };
        }
    } catch (error) {
        console.error("Update project error:", error);
        return {
            success: false,
            message: "Koneksi Error",
        };
    }
}
