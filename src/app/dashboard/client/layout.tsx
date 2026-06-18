"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ClientNavigation } from "@/components/dashboard/client";
import { Footer } from "@/components/layout/Footer";

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
}

export default function ClientDashboardLayout({
  children,
}: ClientDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col antialiased selection:bg-[#8CC540]/20">
      {/* Public Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="pt-20 md:pt-[7.5vw] flex-1 flex flex-col">
        {/* Horizontal Navigation for Client Dashboard */}
        <ClientNavigation />
        
        {/* Children content page */}
        <main className="flex-1 w-full bg-slate-50 dark:bg-zinc-950">
          {children}
        </main>
      </div>

      {/* Public Footer */}
      <Footer />
    </div>
  );
}
