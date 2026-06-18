"use server";

import { getBackendToken } from "@/lib/auth-helper";

interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Ambil semua user dari MongoDB backend
export async function getAllUsersAction(): Promise<ActionResponse> {
  try {
    const token = await getBackendToken();
    if (!token) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return { success: res.ok, data: data };
  } catch (error) {
    return { success: false, message: "Gagal mengambil data user" };
  }
}

export async function sendAdminReplyAction(targetUserId: string, message: string): Promise<ActionResponse> {
  try {
    const token = await getBackendToken();
    if (!token) return { success: false, message: "Sesi habis." };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat-admin/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId, message }),
    });

    return { success: res.ok, message: res.ok ? "Terkirim" : "Gagal" };
  } catch (error) {
    return { success: false, message: "Koneksi error" };
  }
}

export async function resetUnreadAction(targetUserId: string): Promise<ActionResponse> {
  try {
    const token = await getBackendToken();
    if (!token) return { success: false };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat-admin/reset-unread`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId }),
    });
    return { success: res.ok };
  } catch (error) {
    return { success: false };
  }
}