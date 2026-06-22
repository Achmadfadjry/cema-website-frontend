"use client";

import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reset body styles when auth layout is mounted
  useEffect(() => {
    // Ensure proper body state for auth pages
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    // Cleanup when leaving auth layout
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  return <>{children}</>;

}