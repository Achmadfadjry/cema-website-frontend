"use server";

import { getBackendToken } from "@/lib/auth-helper";

interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export async function fetchDashboardOverviewAction(): Promise<ActionResponse> {
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

        // Mengambil data Proyek dan Layanan secara paralel
        const [projectsRes, servicesRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                headers,
                cache: "no-store",
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
                headers,
                cache: "no-store",
            }),
        ]);

        let projects = [];
        let services = [];

        if (projectsRes.ok) {
            const projectsData = await projectsRes.json();
            // Sesuaikan dengan struktur response backendmu
            projects = projectsData.data || projectsData;
        }

        if (servicesRes.ok) {
            const servicesData = await servicesRes.json();
            services = servicesData.data || servicesData;
        }

        return {
            success: true,
            data: {
                projects: Array.isArray(projects) ? projects : [],
                services: Array.isArray(services) ? services : [],
            },
        };
    } catch (error) {
        console.error("Dashboard fetch error:", error);
        return {
            success: false,
            message: "Gagal menyambungkan ke server",
        };
    }
}