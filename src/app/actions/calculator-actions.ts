"use server";

import { getBackendToken } from "@/lib/auth-helper";

interface CalculatorSettings {
    materials: {
        standard: number;
        premium: number;
        luxury: number;
    };
    roomPrice: number;
}

interface ServiceItem {
    _id: string;
    title: string;
    price: string;
    category: string;
}

interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

/**
 * Fetches calculator settings and services from the backend API
 * @returns ActionResponse with settings and services or error message
 */
export async function fetchCalculatorDataAction(): Promise<
    ActionResponse<{ settings: CalculatorSettings; services: ServiceItem[] }>
> {
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

        const [settingsRes, servicesRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/calculator/settings`, {
                headers,
                cache: "no-store",
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
                headers,
                cache: "no-store",
            }),
        ]);

        let settings: CalculatorSettings = {
            materials: { standard: 1.0, premium: 1.4, luxury: 1.8 },
            roomPrice: 0,
        };

        let services: ServiceItem[] = [];

        // Process settings response
        if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            const realData = settingsData.data || settingsData;

            if (realData) {
                settings = {
                    materials: realData.materials || settings.materials,
                    roomPrice: realData.pricePerRoom ?? 0,
                };
            }
        } else {
            console.error("Gagal load settings:", settingsRes.status);
        }

        // Process services response
        if (servicesRes.ok) {
            const servicesData = await servicesRes.json();
            if (
                servicesData.status === "ok" &&
                Array.isArray(servicesData.data)
            ) {
                services = servicesData.data;
            }
        } else {
            console.error("Gagal load services:", servicesRes.status);
        }

        return {
            success: true,
            data: { settings, services },
        };
    } catch (error) {
        console.error("Fetch calculator data error:", error);
        return {
            success: false,
            message: "Gagal mengambil data",
        };
    }
}

/**
 * Saves calculator settings to the backend API
 * @param settings - Calculator settings to save
 * @returns ActionResponse with success status
 */
export async function saveCalculatorSettingsAction(
    settings: CalculatorSettings
): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi tidak valid atau kadaluarsa. Silakan login ulang.",
            };
        }

        const payload = {
            pricePerRoom: settings.roomPrice,
            materials: settings.materials,
        };

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/calculator/settings`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }
        );

        if (res.ok) {
            return {
                success: true,
                message: "Berhasil menyimpan pengaturan",
            };
        } else {
            const errData = await res.json();
            return {
                success: false,
                message: errData.message || "Unauthorized",
            };
        }
    } catch (error) {
        console.error("Save calculator settings error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan koneksi",
        };
    }
}
