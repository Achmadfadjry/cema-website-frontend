"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut, FolderKanban } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import Image from "next/image";
import { clientNavTabs } from "./navigationConfig";

interface ClientSidebarProps {
  userName: string;
  profilePicture: string;
  onLogout: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isDesktopOpen: boolean;
  toggleDesktopSidebar: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function ClientSidebar({
  userName,
  profilePicture,
  onLogout,
  isMobileOpen,
  setIsMobileOpen,
  isDesktopOpen,
  toggleDesktopSidebar,
}: ClientSidebarProps) {
  const pathname = usePathname();

  const renderSidebarContent = (isMobile: boolean = false) => {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
        {/* User Profile Section with Toggle Button */}
        <div className="p-5 bg-slate-50/40 dark:bg-zinc-900/40 shrink-0 relative">
          <div className="flex items-center gap-4 pr-8">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#8CC540] to-lime-500 text-white font-black text-sm shadow-md shadow-lime-500/20 ring-2 ring-lime-400 ring-offset-2 dark:ring-offset-zinc-900 overflow-hidden shrink-0">
              {profilePicture ? (
                <Image
                  width={160}
                  height={160}
                  src={profilePicture}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(userName)
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight leading-snug truncate" title={userName}>
                {userName}
              </h1>
              <p className="text-[10px] font-black text-[#8CC540] uppercase tracking-widest mt-0.5">
                Client Dashboard
              </p>
            </div>
          </div>

          {/* Close button for Sidebar */}
          <div className="absolute top-5 right-4">
            {isMobile ? (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            ) : (
              <button
                onClick={toggleDesktopSidebar}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-all cursor-pointer hidden lg:block"
                title="Sembunyikan Sidebar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin">
          {clientNavTabs.map((tab) => {
            const isActive = tab.activeCheck(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => isMobile && setIsMobileOpen(false)}
                className={`
                  group flex items-center gap-3 py-3 px-4 text-sm font-extrabold transition-all duration-300 hover:scale-[1.01] active:scale-98
                  ${
                    isActive
                      ? "bg-[#8CC540] text-white shadow-md shadow-lime-500/20 rounded-xl"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100/70 dark:hover:bg-zinc-800/50 rounded-xl"
                  }
                `}
              >
                <span className={`transition-all duration-300 ${isActive ? "text-white" : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-500 dark:group-hover:text-zinc-400"}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Info + Logout */}
        <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              Project Hub
            </span>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl transition-all duration-300 hover:shadow-sm active:scale-95 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-zinc-900 shrink-0 h-full transition-all duration-300 z-30 ${
          isDesktopOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          {/* Drawer Panel */}
          <aside className="relative flex flex-col w-72 max-w-[80vw] bg-white dark:bg-zinc-900 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
