"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import Image from "next/image";

interface ClientHeaderProps {
  userName: string;
  profilePicture: string;
  onLogout: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function ClientHeader({
  userName,
  profilePicture,
  onLogout,
}: ClientHeaderProps) {
  return (
    <header className="bg-transparent w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo + Divider + User Info */}
          <div className="flex items-center gap-5">
            {/* Company Logo (= Home Button) */}
            <Link href="/" className="hover:opacity-95 hover:scale-[1.03] active:scale-95 transition-all duration-300">
              <ImageWithFallback
                src="/images/Cema_Logo.png"
                alt="CEMA Logo"
                width={100}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-slate-200/60 dark:bg-zinc-800" />

            {/* User Profile */}
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-[#8CC540] to-lime-500 text-white font-black text-sm shadow-md shadow-lime-500/20 ring-2 ring-lime-400 ring-offset-2 dark:ring-offset-zinc-950 overflow-hidden shrink-0">
                {profilePicture ? (
                  <Image
                    width={320}
                    height={320}
                    src={profilePicture}
                    alt={userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(userName)
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                  Welcome, {userName}
                </h1>
                <p className="text-[10px] font-black text-[#8CC540] uppercase tracking-widest mt-0.5">
                  Client Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Info + Logout */}
          <div className="flex items-center gap-5">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest hidden md:block">
              Project Hub
            </span>
            <button
              className="flex items-center gap-1.5 bg-slate-100/40 hover:bg-rose-50 dark:bg-zinc-900/40 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900/40 text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-450 px-3.5 py-1.5 rounded-xl transition-all duration-300 text-xs font-bold shadow-sm hover:shadow active:scale-95 cursor-pointer"
              onClick={onLogout}
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
