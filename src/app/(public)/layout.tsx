"use client";

import { useEffect } from "react";
import ChatWidget from "@/components/layout/ChatWidget";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reset body styles when public layout is mounted
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    document.body.style.position = "static";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
        <ChatWidget></ChatWidget>
      </main>
      <Footer />
    </>
  );
}
