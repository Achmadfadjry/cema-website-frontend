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
    <header className="bg-white border-b border-gray-200 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo + Divider + User Info */}
          <div className="flex items-center gap-4">
            {/* Company Logo (= Home Button) */}
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <ImageWithFallback
                src="/images/Cema_Logo.png"
                alt="CEMA Logo"
                width={100}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-gray-200" />

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00BCD4] text-white font-semibold text-sm">
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
              <div>
                <h1 className="text-base font-semibold text-slate-800">
                  Welcome, {userName}
                </h1>
                <p className="text-xs text-slate-500">Client Dashboard</p>
              </div>
            </div>
          </div>

          {/* Right Side: Info + Logout */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:block">
              Track your projects
            </span>
            <button
              className="flex items-center gap-2 bg-gray-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
              onClick={onLogout}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
