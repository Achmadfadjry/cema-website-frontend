"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith("/dashboard/admin");

    // Reset scroll and prevent layout shifts
    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto";
    }, [pathname]);

    return (
        <>
            {children}
        </>
    );
}