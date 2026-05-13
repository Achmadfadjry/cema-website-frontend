"use client";

import { ClientHeader, ClientNavigation } from "@/components/dashboard/client";

import { useSession, signOut } from "next-auth/react";

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
}

export default function ClientDashboardLayout({
  children,
}: ClientDashboardLayoutProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Client";
  const profilePicture = session?.user?.profilePicture || "";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    // Root container: Global scroll enabled
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header Section */}
      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <ClientHeader
          userName={userName}
          profilePicture={profilePicture}
          onLogout={handleLogout}
        />
        <ClientNavigation />
      </div>

      {/* Main Content Area */}
      <main>{children}</main>
    </div>
  );
}
