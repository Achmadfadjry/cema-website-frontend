"use server";

import { getBackendToken } from "@/lib/auth-helper";
import { Portfolio } from "@/lib/types";

interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

/**
 * Fetches all portfolios from the backend API
 * @returns ActionResponse with portfolios array
 */
export async function fetchPortfoliosAction(): Promise<ActionResponse<Portfolio[]>> {
    try {
        const token = await getBackendToken();

        // Note: GET requests might be public, but if it needs token:
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio`, {
            method: "GET",
            headers,
            cache: "no-store",
        });

        const data = await res.json();

        if (res.ok) {
            return {
                success: true,
                data: data.data || [],
            };
        }

        return {
            success: false,
            message: data.message || "Gagal mengambil data portfolio",
        };

    } catch (error) {
        console.error("Fetch portfolios error:", error);
        return {
            success: false,
            message: "Gagal mengambil data",
        };
    }
}

/**
 * Creates a new portfolio item
 * @param formData - FormData containing fields and file
 * @returns ActionResponse
 */
export async function createPortfolioAction(formData: FormData): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        // Prepare headers - DO NOT set Content-Type for FormData, browser/fetch sets it with boundary
        const headers: HeadersInit = {
            Authorization: `Bearer ${token}`,
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio`, {
            method: "POST",
            headers,
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            return {
                success: true,
                data: data.data,
                message: "Portfolio berhasil dibuat",
            };
        }

        return {
            success: false,
            message: data.message || "Gagal membuat portfolio",
        };

    } catch (error) {
        console.error("Create portfolio error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan server",
        };
    }
}

/**
 * Updates an existing portfolio item
 * @param id - Portfolio ID
 * @param formData - FormData with updates
 * @returns ActionResponse
 */
export async function updatePortfolioAction(id: string, formData: FormData): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const headers: HeadersInit = {
            Authorization: `Bearer ${token}`,
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/${id}`, {
            method: "PUT",
            headers,
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            return {
                success: true,
                data: data.data,
                message: "Portfolio berhasil diupdate",
            };
        }

        return {
            success: false,
            message: data.message || "Gagal update portfolio",
        };

    } catch (error) {
        console.error("Update portfolio error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan server",
        };
    }
}

/**
 * Updates an existing portfolio status (JSON payload version)
 * Used for toggling visibility without file upload
 * @param id - Portfolio ID
 * @param payload - Object with fields to update
 * @returns ActionResponse
 */
export async function updatePortfolioStatusAction(id: string, payload: any): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
            return {
                success: true,
                data: data.data,
                message: "Status berhasil diupdate",
            };
        }

        return {
            success: false,
            message: data.message || "Gagal update status",
        };

    } catch (error) {
        console.error("Update portfolio status error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan server",
        };
    }
}

/**
 * Deletes a portfolio item
 * @param id - Portfolio ID
 * @returns ActionResponse
 */
export async function deletePortfolioAction(id: string): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            return {
                success: true,
                message: "Portfolio berhasil dihapus",
            };
        }

        const data = await res.json();
        return {
            success: false,
            message: data.message || "Gagal menghapus portfolio",
        };

    } catch (error) {
        console.error("Delete portfolio error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan server",
        };
    }
}
