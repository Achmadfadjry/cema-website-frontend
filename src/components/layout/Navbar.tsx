"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import Link from "next/link";
import { CustomButton } from "@/components/ui/custom-button";
import { UserMenu } from "@/components/layout/user-menu";
import type { NavItem } from "@/lib/types";
import { UserRole } from "@/lib/types"; // Keeping UserRole for type casting if needed
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const currentTheme = savedTheme || (document.documentElement.classList.contains("dark") ? "dark" : "light");
    setTheme(currentTheme);
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Map session user to component User type
  const user = session?.user
    ? {
        id: session.user.id || "current",
        name: session.user.name || "User",
        email: session.user.email || "",
        profilePicture: session.user.profilePicture || null,
        role: (session.user.role as UserRole) || UserRole.GUEST,
      }
    : null;

  // Global Logout Function
  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const menuItems: NavItem[] = [
    { id: "home", label: "Home", href: "/" },
    ...(user && user.role === UserRole.CLIENT
      ? [{ id: "my-project", label: "My Project", href: "/dashboard/client/my-project" }]
      : []),
    { id: "portfolio", label: "Portfolio", href: "/portfolio" },
    { id: "services", label: "Services", href: "/services" },
    { id: "about", label: "About Us", href: "/about" },
    { id: "contact", label: "Contact Us", href: "/contact" },
  ];

  const isActive = (path: string) => pathname === path;

  // Mencegah flash konten sebelum mounted
  if (!mounted) return null;

  return (
    <header className="fixed left-0 top-0 w-full z-[1000]">
      <nav
        className="w-full px-[5vw] py-[1.11vw] flex flex-row items-center bg-white/85 dark:bg-zinc-950/85 border-b border-gray-200/50 dark:border-zinc-800/50 transition-colors duration-300"
        style={{
          boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.15)",
          backdropFilter: "blur(1.11rem)",
          WebkitBackdropFilter: "blur(1.11rem)",
        }}
      >
        {/* Logo */}
        <Link href="/">
          <motion.div
            className="cursor-pointer h-16 md:h-[4vw] min-h-[3rem] max-h-[5rem]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <ImageWithFallback
              src="/images/Cema_Logo.png"
              alt="Cema Logo"
              className="h-full w-auto object-contain"
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex flex-row gap-6 list-none ml-auto items-center">
          {menuItems.map((item) => (
            <motion.li
              key={item.id}
              className="text-[0.67rem] lg:text-[0.875rem] text-black dark:text-zinc-100 cursor-pointer relative font-semibold"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href={item.href}>
                <motion.span
                  className="relative inline-block"
                  initial={false}
                  animate={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
                >
                  {item.label}
                  <motion.span
                    className="absolute left-0 bottom-0 w-full h-[1px] bg-black dark:bg-zinc-100"
                    initial={false}
                    animate={
                      isActive(item.href)
                        ? { scaleX: 1, opacity: 1 }
                        : { scaleX: 0, opacity: 0 }
                    }
                    whileHover={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{
                      originX: 0,
                      transformOrigin: "left",
                      bottom: "-0.3rem",
                    }}
                  />
                </motion.span>
              </Link>
            </motion.li>
          ))}

          {/* Auth Section Desktop */}
          <li className="ml-4 flex items-center gap-2">
            {user ? (
              // Jika User Login, Tampilkan UserMenu
              <div className="flex items-center gap-4">
                <UserMenu user={user} />
              </div>
            ) : (
              // Jika Belum Login, Tampilkan HANYA Login
              <div className="flex gap-2">
                <Link href="/login">
                  <CustomButton variant="default" size="sm">
                    Login
                  </CustomButton>
                </Link>
              </div>
            )}

            {/* Desktop Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ml-1"
              title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
            >
              {theme === "light" ? (
                <Moon size={16} className="transition-transform duration-300 hover:rotate-12" />
              ) : (
                <Sun size={16} className="transition-transform duration-500 hover:rotate-90" />
              )}
            </button>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden ml-auto text-[#333333] dark:text-zinc-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-zinc-950/95 border-t border-gray-200 dark:border-zinc-800 overflow-hidden"
            style={{
              backdropFilter: "blur(1.11rem)",
              WebkitBackdropFilter: "blur(1.11rem)",
            }}
          >
            <div className="px-4 py-4 space-y-3">
              {menuItems.map((item) => (
                <Link key={item.id} href={item.href}>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className={`block w-full text-left px-4 py-2 rounded-lg ${
                      isActive(item.href)
                        ? "bg-[#8CC55A] text-white"
                        : "text-black dark:text-zinc-200 hover:bg-[#F7F7F7] dark:hover:bg-zinc-900"
                    } transition-colors`}
                  >
                    {item.label}
                  </button>
                </Link>
              ))}

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                {user ? (
                  // Tampilan Mobile Jika Login
                  <div className="space-y-2">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-zinc-100">
                        Halo, {user.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-zinc-400 capitalize">
                        {user.role}
                      </p>
                    </div>

                    {user.role === UserRole.ADMIN && (
                      <Link href="/dashboard">
                        <button className="block w-full text-left px-4 py-2 rounded-lg text-black dark:text-zinc-200 hover:bg-[#F7F7F7] dark:hover:bg-zinc-900 transition-colors font-medium">
                          Dashboard
                        </button>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  // Tampilan Mobile Jika Belum Login (HANYA Login)
                  <div className="space-y-2">
                    <Link href="/login">
                      <CustomButton
                        variant="default"
                        size="sm"
                        className="w-full"
                      >
                        Login
                      </CustomButton>
                    </Link>
                  </div>
                )}

                {/* Mobile Theme Toggle */}
                <div className="pt-2">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-black dark:text-zinc-200 hover:bg-[#F7F7F7] dark:hover:bg-zinc-900 transition-colors font-medium text-left cursor-pointer"
                  >
                    <span>Mode {theme === "light" ? "Gelap" : "Terang"}</span>
                    {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
