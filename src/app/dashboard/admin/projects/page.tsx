"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2,
} from "lucide-react";
import {
  fetchProjectsAction,
  updateProjectAction,
} from "@/app/actions/project-actions";

// Tipe Data Project
interface Project {
  _id: string;
  id: string;
  name: string;
  clientName: string;
  status: string;
  progress: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30";
    case "CONSTRUCTION":
    case "DESIGN":
      return "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30";
    case "LEAD":
    case "RETENTION":
      return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30";
    case "CANCELLED":
      return "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-150 dark:border-red-900/30";
    default:
      return "bg-slate-50 dark:bg-zinc-800 text-slate-750 dark:text-zinc-400 border-slate-200 dark:border-zinc-700";
  }
};

const getStatusLabel = (status: string) => {
  return status;
};

export default function AdminProjectsPage() {
  const { data: session, status } = useSession();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const statusOptions = [
    "ALL",
    "LEAD",
    "DESIGN",
    "CONSTRUCTION",
    "RETENTION",
    "COMPLETED",
    "CANCELLED",
  ];

  // State untuk Toast Notification
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 3000);
  };

  // --- FETCH DATA ---
  const fetchProjects = async () => {
    if (status === "loading") return;

    try {
      setIsLoading(true);
      const result = await fetchProjectsAction();
      if (result.success && result.data) {
        setProjects(result.data);
      } else {
        showAlert(result.message || "Gagal mengambil data proyek", "error");
      }
    } catch (error) {
      showAlert("Gagal mengambil data proyek", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [status]);

  // --- UPDATE PROGRESS & STATUS ---
  const handleUpdate = async (projectId: string, payload: any) => {
    if (!projectId) return;

    setIsUpdating(projectId);
    try {
      const result = await updateProjectAction(projectId, payload);

      if (result.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, ...payload } : p))
        );
        showAlert(result.message || "Progres pengerjaan berhasil disimpan!", "success");
      } else {
        showAlert(result.message || "Gagal menyimpan progres", "error");
      }
    } catch (error: any) {
      showAlert("Terjadi kesalahan server", "error");
    } finally {
      setIsUpdating(null);
    }
  };

  // --- FILTER & SEARCH LOGIC ---
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        (project.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (project.clientName?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  if (isLoading || status === "loading") {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm gap-4 transition-colors duration-300">
        <div>
          <h3 className="font-black text-lg text-slate-800 dark:text-zinc-100 tracking-tight">
            Semua Proyek
          </h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
            Pantau & Update Progres Konstruksi & Desain Klien
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm transition-colors duration-300">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 h-4 w-4" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-medium placeholder-slate-400 dark:placeholder-zinc-500"
            placeholder="Cari nama proyek, nama klien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="text-slate-455 dark:text-zinc-500 h-4 w-4 shrink-0" />
          <select
            className="p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 text-xs font-medium cursor-pointer transition-all min-w-[150px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Proyek & Klien</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progres (%)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 dark:text-zinc-200">
                      {project.name}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                      Klien: {project.clientName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 text-xs font-medium cursor-pointer transition-all disabled:opacity-50 min-w-[130px]"
                      value={project.status ?? "LEAD"}
                      onChange={(e) =>
                        handleUpdate(project.id, { status: e.target.value })
                      }
                      disabled={isUpdating === project.id}
                    >
                      {statusOptions
                        .filter((s) => s !== "ALL")
                        .map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                          Pengerjaan: {project.progress ?? 0}%
                          {(project.progress ?? 0) === 100 ? (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          ) : (project.progress ?? 0) > 0 ? (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          ) : (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={project.progress ?? 0}
                          onChange={(e) =>
                            setProjects((prev) =>
                              prev.map((p) =>
                                p.id === project.id
                                  ? { ...p, progress: Number(e.target.value) }
                                  : p
                              )
                            )
                          }
                          className="flex-1 accent-primary bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        handleUpdate(project.id, {
                          progress: project.progress ?? 0,
                        })
                      }
                      disabled={isUpdating === project.id}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg disabled:bg-primary/50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                    >
                      {isUpdating === project.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save size={13} />
                      )}
                      Simpan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-sm italic">
              Tidak ada proyek yang sesuai dengan pencarian atau filter.
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {alert.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-350">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold transition-all ${
              alert.type === "success"
                ? "bg-green-50 dark:bg-green-950/25 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950/25 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400"
            }`}
          >
            {alert.type === "success" ? (
              <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className="leading-tight">{alert.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
