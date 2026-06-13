"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Trash2,
  UserCog,
  Loader2,
  Search,
  AlertCircle,
  CheckCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  fetchUsersAction,
  updateUserRoleAction,
  deleteUserAction,
} from "@/app/actions/user-actions";

type Role = "client" | "admin" | "project_manager" | "staff";

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  profilePicture?: string;
  createdAt: string;
}

const getRoleStyles = (role: Role) => {
  switch (role) {
    case "admin":
      return "bg-green-55 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30";
    case "project_manager":
      return "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-405 border-blue-200 dark:border-blue-900/30";
    case "staff":
      return "bg-amber-50 dark:bg-amber-950/20 text-amber-705 dark:text-amber-400 border-amber-200 dark:border-amber-900/30";
    default:
      return "bg-slate-50 dark:bg-zinc-800 text-slate-1000 dark:text-zinc-400 border-slate-200 dark:border-zinc-700";
  }
};

export default function UserManagementPage() {
  const { data: session, status } = useSession();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string | null;
  }>({
    isOpen: false,
    userId: null,
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      setLoading(true);
      const result = await fetchUsersAction();

      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        showToast(result.message || "Gagal memuat data user", "error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showToast("Gagal memuat data user", "error");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (id: string, newRole: Role) => {
    setUpdatingId(id);
    try {
      const result = await updateUserRoleAction(id, newRole);

      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
        );
        showToast(result.message || "Role berhasil diperbarui!");
      } else {
        showToast(result.message || "Gagal memperbarui role", "error");
      }
    } catch (error) {
      showToast("Kesalahan koneksi", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const executeDelete = async () => {
    const id = confirmModal.userId;
    if (!id) return;

    try {
      const result = await deleteUserAction(id);

      if (result.success) {
        setUsers(users.filter((u) => u._id !== id));
        showToast(result.message || "User berhasil dihapus");
      } else {
        showToast(result.message || "Gagal menghapus user", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setConfirmModal({ isOpen: false, userId: null });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || (loading && users.length === 0)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Toast alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-350">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold transition-all bg-white dark:bg-zinc-900 ${
              toast.type === "success"
                ? "border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-400"
                : "border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className="leading-tight">{toast.msg}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Confirm modal delete */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 text-center transition-colors duration-300">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-650" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-zinc-100 tracking-tight">
              Hapus Pengguna?
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 mb-6 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Data user akan dihapus permanen dari sistem.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmModal({ isOpen: false, userId: null })}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm gap-4 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
            <UserCog size={22} />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800 dark:text-zinc-100 tracking-tight">
              User Management
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              Kelola Hak Akses dan Informasi Tim Cema Design
            </p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 h-4 w-4" />
          <input
            type="text"
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-medium placeholder-slate-400 dark:placeholder-zinc-500"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User Profile</th>
                <th className="px-6 py-4">Role Access</th>
                <th className="px-6 py-4">Registration</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-black text-sm overflow-hidden shrink-0">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          (user.name?.[0] || user.email[0]).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-zinc-200">
                          {user.name || "User"}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      disabled={updatingId === user._id}
                      onChange={(e) =>
                        handleUpdateRole(user._id, e.target.value as Role)
                      }
                      className={`p-2 border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-[10px] font-black tracking-wider uppercase cursor-pointer transition-all disabled:opacity-50 min-w-[130px] ${getRoleStyles(user.role)}`}
                    >
                      <option value="admin" className="text-slate-805 dark:text-zinc-200 bg-white dark:bg-zinc-900 font-bold">ADMIN</option>
                      <option value="project_manager" className="text-slate-805 dark:text-zinc-200 bg-white dark:bg-zinc-900 font-bold">PM</option>
                      <option value="staff" className="text-slate-805 dark:text-zinc-200 bg-white dark:bg-zinc-900 font-bold">STAFF</option>
                      <option value="client" className="text-slate-805 dark:text-zinc-200 bg-white dark:bg-zinc-900 font-bold">CLIENT</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        setConfirmModal({ isOpen: true, userId: user._id })
                      }
                      className="p-2 text-red-400 hover:text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all active:scale-95 cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-sm italic">
              Tidak ada pengguna yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
