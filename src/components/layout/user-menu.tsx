"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { CustomButton } from "@/components/ui/custom-button";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";
import type { User as UserType } from "@/lib/types";
import Image from "next/image";

interface UserMenuProps {
  user: UserType;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Get user initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00BCD4] text-white font-semibold text-sm hover:bg-[#00ACC1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:ring-offset-2"
      >
        {user.profilePicture ? (
          <Image
            width={320}
            height={320}
            src={user.profilePicture}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(user.name)
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">{user.role}</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard size={16} className="text-gray-500" />
                Dashboard
              </Link>
            </div>

            {/* Logout Button */}
            <div className="px-4 py-3 border-t border-gray-200">
              <CustomButton
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="w-full"
              >
                Logout
              </CustomButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
