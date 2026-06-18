"use server";

import { getBackendToken } from "@/lib/auth-helper";

interface ServiceItem {
    _id: string;
    id: string; // Sometimes ID is returned as 'id' or '_id'
    title: string;
    category: string;
    price: string;
    description: string;
    image: string;
    isPopular: boolean;
    isShown: boolean;
    features: string[];
}

interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

/**
 * Fetches all services from the backend API
 * @returns ActionResponse with services array or error message
 */
export async function fetchServicesAction(): Promise<
    ActionResponse<ServiceItem[]>
> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (res.ok) {
            const response = await res.json();
            if (response.status === "ok") {
                return {
                    success: true,
                    data: response.data,
                };
            }
        }

        return {
            success: false,
            message: "Gagal mengambil data layanan",
        };
    } catch (error) {
        console.error("Fetch services error:", error);
        return {
            success: false,
            message: "Gagal mengambil data",
        };
    }
}

/**
 * Creates a new service
 * @param payload - Service data to create
 * @returns ActionResponse with created service or error message
 */
export async function createServiceAction(payload: any): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.status === "ok") {
            return {
                success: true,
                message: "Layanan berhasil disimpan!",
                data: data.data,
            };
        } else {
            return {
                success: false,
                message: data.message || "Gagal menyimpan layanan",
            };
        }
    } catch (error) {
        console.error("Create service error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan server",
        };
    }
}

/**
 * Deletes a service
 * @param id - Service ID to delete
 * @returns ActionResponse with success status
 */
export async function deleteServiceAction(id: string): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok || res.status === 404) {
            return {
                success: true,
                message: "Layanan berhasil dihapus",
            };
        }

        const data = await res.json();
        return {
            success: false,
            message: data.message || "Gagal menghapus layanan",
        };
    } catch (error) {
        console.error("Delete service error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan koneksi",
        };
    }
}

/**
 * Updates a service status (or full update)
 * @param id - Service ID to update
 * @param payload - Data to update
 * @returns ActionResponse with success status
 */
export async function updateServiceAction(id: string, payload: any): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            return {
                success: true,
                message: "Berhasil update layanan"
            }
        }

        const errData = await res.json();
        return {
            success: false,
            message: errData.message || "Gagal update layanan",
        };

    } catch (error) {
        console.error("Update service error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan server",
        };
    }
}
