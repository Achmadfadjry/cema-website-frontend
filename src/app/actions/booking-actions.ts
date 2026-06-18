"use server";

import { getBackendToken } from "@/lib/auth-helper";

interface BookingPayload {
    booking_type: "NEW";
    clientName?: string;
    serviceType: string;
    projectDescription: string;
    date: string;
    time: string;
    event: string;
    isOnline: boolean;
    phone?: string;
}

interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export async function createBookingAction(payload: BookingPayload): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Anda harus login untuk melakukan booking.",
            };
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedules`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.status === "success") {
            return {
                success: true,
                message: "Booking berhasil dibuat!",
                data: data.data,
            };
        } else {
            return {
                success: false,
                message: data.message || "Gagal membuat booking",
            };
        }
    } catch (error) {
        console.error("Create booking error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan server saat membuat booking",
        };
    }
}
