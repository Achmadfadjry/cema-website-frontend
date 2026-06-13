"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Package,
  MessageCircle,
  FileQuestion,
  FolderKanban,
  Users,
  Calculator,
  LogOut,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
  Lock,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    const savedTheme = (localStorage.getItem("admin-theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("admin-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Auth roles validation
  const isAuthorized =
    session &&
    (session.user.role === "admin" ||
      session.user.role === "project_manager" ||
      session.user.role === "staff");

  // Menu Navigasi Admin
  const tabs = [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: <LayoutDashboard size={18} />,
      activeCheck: (path: string) => path === "/dashboard/admin",
    },
    {
      label: "Portfolio",
      href: "/dashboard/admin/portfolio",
      icon: <Briefcase size={18} />,
      activeCheck: (path: string) => path.includes("/portfolio"),
    },
    {
      label: "Layanan",
      href: "/dashboard/admin/service",
      icon: <Package size={18} />,
      activeCheck: (path: string) => path.includes("/service"),
    },
    {
      label: "Chat Client",
      href: "/dashboard/admin/chat-client",
      icon: <MessageCircle size={18} />,
      activeCheck: (path: string) => path.includes("/chat-client"),
    },
    {
      label: "Semua Proyek",
      href: "/dashboard/admin/projects",
      icon: <FolderKanban size={18} />,
      activeCheck: (path: string) => path.includes("/projects"),
    },
    {
      label: "User Management",
      href: "/dashboard/admin/user-management",
      icon: <Users size={18} />,
      activeCheck: (path: string) =>
        path.includes("/users") || path.includes("/user-management"),
    },
    {
      label: "Kalkulator",
      href: "/dashboard/admin/kalkulator",
      icon: <Calculator size={18} />,
      activeCheck: (path: string) =>
        path.includes("/kalkulator") || path.includes("/calculator"),
    },
    {
      label: "Design Quiz",
      href: "/dashboard/admin/design-kuis",
      icon: <FileQuestion size={18} />,
      activeCheck: (path: string) => path.includes("/design-kuis"),
    },
    {
      label: "Chat CS",
      href: "/dashboard/admin/chat-cs",
      icon: <MessageCircle size={18} />,
      activeCheck: (path: string) => path.includes("/chat-cs"),
    },
  ];

  // 1. Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <ShieldCheck size={24} className="absolute text-primary animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-zinc-400 animate-pulse">
          Memuat Panel Admin...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated state will trigger redirect in useEffect, show loading in the meantime
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // 3. Unauthorized State (e.g. client role)
  if (status === "authenticated" && !isAuthorized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 text-center transition-all duration-300">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400 mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
            Maaf, akun Anda tidak memiliki izin untuk mengakses area administrasi ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-primary/20 active:scale-95 cursor-pointer"
            >
              Kembali ke Beranda
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              Keluar Sesi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Main Layout
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex transition-colors duration-300">
      
      {/* SIDEBAR ON DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 shrink-0 sticky top-0 h-screen transition-colors duration-300">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-zinc-800">
          <div className="bg-primary/10 p-2 rounded-lg">
            <ShieldCheck size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-zinc-100">
              Cema Design
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const isActive = tab.activeCheck(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex items-center gap-3 py-3 text-sm font-semibold transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary/10 dark:bg-primary/20 text-primary border-l-4 border-primary rounded-r-xl rounded-l-none -ml-4 pl-3 pr-4 shadow-sm shadow-primary/5"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 rounded-xl pl-4 pr-4"
                  }
                `}
              >
                <span className={isActive ? "text-primary" : "text-slate-400 dark:text-zinc-500 transition-colors"}>
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile / Logout bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 overflow-hidden">
              {session?.user?.profilePicture ? (
                <img
                  src={session.user.profilePicture}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                (session?.user?.name?.[0] || "A").toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                {session?.user?.role?.replace("_", " ") || "Administrator"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={14} />
            Logout Panel
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <aside className="relative flex flex-col w-72 max-w-[80vw] bg-white dark:bg-zinc-900 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-zinc-100">
                    Cema Design
                  </h1>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {tabs.map((tab) => {
                const isActive = tab.activeCheck(pathname);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 py-3 text-sm font-semibold transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary/10 dark:bg-primary/20 text-primary border-l-4 border-primary rounded-r-xl rounded-l-none -ml-4 pl-3 pr-4 shadow-sm shadow-primary/5"
                          : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 rounded-xl pl-4 pr-4"
                      }
                    `}
                  >
                    <span className={isActive ? "text-primary" : "text-slate-400 dark:text-zinc-500 transition-colors"}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 overflow-hidden">
                  {session?.user?.profilePicture ? (
                    <img
                      src={session.user.profilePicture}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (session?.user?.name?.[0] || "A").toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
                    {session?.user?.name || "Admin"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                    {session?.user?.role?.replace("_", " ") || "Administrator"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl transition-all cursor-pointer"
              >
                <LogOut size={14} />
                Logout Panel
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* RIGHT SIDE MAIN WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 lg:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 hidden sm:block">
              {tabs.find((tab) => tab.activeCheck(pathname))?.label || "Admin Area"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hidden md:block">
              Halo, {session?.user?.name || "Admin"}
            </span>

            {/* THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
            >
              {theme === "light" ? (
                <Moon size={18} className="transition-transform duration-300 hover:rotate-12" />
              ) : (
                <Sun size={18} className="transition-transform duration-500 hover:rotate-90" />
              )}
            </button>

            {/* LOGOUT QUICK */}
            <button
              onClick={handleLogout}
              className="flex lg:hidden items-center justify-center p-2 rounded-xl border border-red-200/50 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* MAIN CONTENT WRAPPER */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
