"use client";

import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { clientNavTabs } from "./navigationConfig";

interface ClientNavbarProps {
  userName: string;
  profilePicture: string;
  onLogout: () => void;
  isDesktopOpen: boolean;
  toggleDesktopSidebar: () => void;
  setIsMobileOpen: (open: boolean) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function ClientNavbar({
  userName,
  profilePicture,
  onLogout,
  isDesktopOpen,
  toggleDesktopSidebar,
  setIsMobileOpen,
}: ClientNavbarProps) {
  const pathname = usePathname();
  const activeTab = clientNavTabs.find((tab) => tab.activeCheck(pathname));
  const activeLabel = activeTab ? activeTab.label : "Client Dashboard";

  return (
    <header className="h-16 shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile burger button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 lg:hidden cursor-pointer transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Desktop burger button (only visible when desktop sidebar is closed/collapsed) */}
        {!isDesktopOpen && (
          <button
            onClick={toggleDesktopSidebar}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 hidden lg:block cursor-pointer transition-colors"
            title="Tampilkan Sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Logo and Active Route Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all duration-300 shrink-0">
            <ImageWithFallback
              src="/images/Cema_Logo.png"
              alt="CEMA Logo"
              width={80}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 shrink-0" />
          <h2 className="text-sm font-black text-slate-800 dark:text-zinc-100 tracking-tight transition-colors duration-300">
            {activeLabel}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Greetings (Desktop) */}
        <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 hidden sm:block">
          Welcome back, <strong className="text-slate-700 dark:text-zinc-300 font-extrabold">{userName}</strong>
        </span>

        {/* Profile Avatar Quick Indicator */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8CC540] to-lime-500 text-white font-black text-xs flex items-center justify-center border border-lime-400/30 overflow-hidden shrink-0">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(userName)
          )}
        </div>

        {/* Quick Mobile Logout (Only visible on mobile, since sidebar is hidden) */}
        <button
          onClick={onLogout}
          className="flex lg:hidden items-center justify-center p-2 rounded-xl border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
