"use server";

import { getBackendToken } from "@/lib/auth-helper";

type Role = "client" | "admin" | "project_manager" | "staff";

interface User {
    _id: string;
    name: string;
    email: string;
    role: Role;
    profilePicture?: string;
    createdAt: string;
}

interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

/**
 * Fetches all users from the backend API
 * @returns ActionResponse with users array or error message
 */
export async function fetchUsersAction(): Promise<ActionResponse<User[]>> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
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

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return {
                success: false,
                message: "Server Error: Bukan JSON",
            };
        }

        const result = await res.json();

        if (res.ok) {
            return {
                success: true,
                data: result.data || result,
            };
        } else {
            return {
                success: false,
                message: result.message || "Gagal memuat data user",
            };
        }
    } catch (error) {
        console.error("Fetch users error:", error);
        return {
            success: false,
            message: "Gagal memuat data user",
        };
    }
}

/**
 * Updates a user's role
 * @param id - User ID
 * @param role - New role to assign
 * @returns ActionResponse with success status
 */
export async function updateUserRoleAction(
    id: string,
    role: Role
): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ role }),
        });

        if (res.ok) {
            return {
                success: true,
                message: "Role berhasil diperbarui!",
            };
        } else {
            const result = await res.json().catch(() => ({}));
            return {
                success: false,
                message: result.message || "Gagal memperbarui role",
            };
        }
    } catch (error) {
        console.error("Update role error:", error);
        return {
            success: false,
            message: "Kesalahan koneksi",
        };
    }
}

/**
 * Deletes a user by ID
 * @param id - User ID to delete
 * @returns ActionResponse with success status
 */
export async function deleteUserAction(id: string): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            return {
                success: true,
                message: "User berhasil dihapus",
            };
        } else {
            const result = await res.json().catch(() => ({}));
            return {
                success: false,
                message: result.message || "Gagal menghapus user",
            };
        }
    } catch (error) {
        console.error("Delete user error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan sistem",
        };
    }
}
