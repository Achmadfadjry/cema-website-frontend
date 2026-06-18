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

    // Reset scroll, overflow, and ensure layout consistency
    useEffect(() => {
        // Reset to auto state
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";
        
        // Reset scroll position
        window.scrollTo(0, 0);
        
        // Remove any fixed/sticky issues
        document.body.style.position = "static";
    }, [pathname]);

    return (
        <>
            {children}
        </>
    );
}