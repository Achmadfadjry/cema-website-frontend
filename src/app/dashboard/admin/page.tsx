"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Wallet,
  MoreHorizontal,
  X,
  BookOpen,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { fetchDashboardOverviewAction } from "@/app/actions/overview";

// --- Helper Functions ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30";
    case "in-progress":
      return "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30";
    case "pending":
      return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30";
    default:
      return "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 border-slate-200 dark:border-zinc-700";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Selesai";
    case "in-progress":
      return "Berjalan";
    case "pending":
      return "Menunggu";
    default:
      return status;
  }
};

export default function AdminOverviewPage() {
  const router = useRouter();

  // --- State Management ---
  const [data, setData] = useState<{ projects: any[]; services: any[] }>({
    projects: [],
    services: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  // --- BFF Fetching Logic ---
  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      const response = await fetchDashboardOverviewAction();

      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || "Gagal memuat data");
      }
      setIsLoading(false);
    }

    loadDashboard();
  }, []);

  // --- Dynamic KPI Calculations ---
  const totalRevenue = data.projects.reduce(
    (acc, p) => acc + (p.budget || 0),
    0
  );
  const activeProjects = data.projects.filter((p) => {
    const progressVal = p.progress !== undefined && p.progress !== null ? p.progress : (p.status === "completed" ? 100 : p.status === "in-progress" ? 45 : 0);
    return progressVal > 0 && progressVal < 100;
  }).length;
  const completedProjects = data.projects.filter((p) => {
    const progressVal = p.progress !== undefined && p.progress !== null ? p.progress : (p.status === "completed" ? 100 : p.status === "in-progress" ? 45 : 0);
    return progressVal >= 100;
  }).length;

  // --- Hardcoded Dokumentasi ---
  const docFeatures = [
    {
      title: "Overview",
      desc: "Ringkasan statistik utama dan performa bisnis.",
      steps: ["Pantau total proyek, proyek aktif, proyek selesai, dan total pendapatan secara real-time.", "Lihat daftar 5 proyek terbaru beserta progres pengerjaannya.", "Akses cepat ke detail menu utama admin."],
    },
    { 
      title: "Portfolio", 
      desc: "Kelola showcase proyek.", 
      steps: ["Tambah item portfolio baru beserta judul, kategori, deskripsi, tanggal, dan foto.", "Aktifkan status 'Show on Home' untuk menampilkan proyek pada halaman utama portofolio.", "Edit detail portofolio atau hapus proyek yang sudah tidak relevan."] 
    },
    { 
      title: "Layanan", 
      desc: "Atur daftar jasa dan harga.", 
      steps: ["Kelola jenis layanan desain yang ditawarkan (interior, arsitektur, dll).", "Atur harga dasar layanan yang akan terintegrasi secara otomatis dengan kalkulator simulasi.", "Ubah status layanan menjadi aktif/nonaktif untuk mengatur ketersediaannya."] 
    },
    { 
      title: "Chat Client", 
      desc: "Balas pesan real-time.", 
      steps: ["Lihat pesan masuk dari klien yang diidentifikasi melalui email dan nama.", "Kirim balasan chat yang tersinkronisasi langsung dengan Firebase Database.", "Hapus sesi chat lama yang telah selesai ditangani."] 
    },
    { 
      title: "Semua Proyek", 
      desc: "Manajemen status proyek.", 
      steps: ["Pantau seluruh daftar pengerjaan proyek dari tahap penawaran hingga selesai.", "Gunakan range slider untuk mengupdate progres pengerjaan dalam persentase (%).", "Ubah status siklus proyek (Lead, Design, Construction, dll) secara instan."] 
    },
    {
      title: "User Management",
      desc: "Kelola akses admin/staff.",
      steps: ["Lihat seluruh akun terdaftar beserta detail profil dan email mereka.", "Ubah hak akses/role pengguna (Admin, PM, Staff, Client) melalui pilihan dropdown.", "Hapus akun pengguna yang tidak aktif dengan konfirmasi keamanan."]
    },
    { 
      title: "Kalkulator", 
      desc: "Set gambaran harga cepat.", 
      steps: ["Atur harga multiplier material (Standard, Premium, Luxury) secara presisi.", "Atur biaya dasar per ruangan tambahan.", "Uji hasil kalkulasi melalui panel simulasi live preview."] 
    },
  ];

  const handleCloseModal = () => {
    setIsDocOpen(false);
    setTimeout(() => setSelectedFeature(null), 300);
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 dark:text-zinc-400">
        <Loader2 className="animate-spin mb-2 text-primary" size={32} />
        <p className="animate-pulse text-sm">Sinkronisasi data dengan server...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-200 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
            Halo, selamat datang kembali di Panel Admin Cema Design.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-500 dark:text-zinc-400 shadow-sm self-start sm:self-auto transition-colors duration-300">
          Update: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex items-start justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Total Proyek
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              {data.projects.length}
            </h3>
          </div>
          <div className="p-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl border border-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Briefcase size={22} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex items-start justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Proyek Aktif
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              {activeProjects}
            </h3>
          </div>
          <div className="p-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl border border-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Clock size={22} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex items-start justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Proyek Selesai
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              {completedProjects}
            </h3>
          </div>
          <div className="p-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl border border-primary/20 group-hover:scale-110 transition-transform duration-300">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex items-start justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Total Revenue
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 truncate max-w-[150px] tracking-tight">
              {formatCurrency(totalRevenue)}
            </h3>
          </div>
          <div className="p-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl border border-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Wallet size={22} />
          </div>
        </div>
      </div>

      {/* --- CONTENT LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TABLE RECENT PROJECTS */}
         <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 transition-colors duration-300">
            <h3 className="font-bold text-slate-800 dark:text-zinc-200">
              Proyek Terbaru
            </h3>
            <button
              onClick={() => router.push("/dashboard/admin/projects")}
              className="text-xs text-primary hover:text-primary-hover font-bold hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto flex-1 scrollbar-thin">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50/75 dark:bg-zinc-950/40 text-slate-400 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800/80 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Nama Proyek</th>
                  <th className="px-6 py-3.5">Progres</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {[...data.projects]
                  .sort((a, b) => {
                    const progressA =
                      a.progress !== undefined && a.progress !== null
                        ? a.progress
                        : (a.status === "completed"
                        ? 100
                        : a.status === "in-progress"
                        ? 45
                        : 0);
                    const progressB =
                      b.progress !== undefined && b.progress !== null
                        ? b.progress
                        : (b.status === "completed"
                        ? 100
                        : b.status === "in-progress"
                        ? 45
                        : 0);
                    return progressB - progressA;
                  })
                  .slice(0, 8)
                  .map((project) => {
                    const progressValue =
                      project.progress !== undefined && project.progress !== null
                        ? project.progress
                        : (project.status === "completed"
                        ? 100
                        : project.status === "in-progress"
                        ? 45
                        : 0);

                  return (
                    <tr
                      key={project._id || project.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/20 transition-all duration-150 border-b border-slate-100 dark:border-zinc-800/50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
                          {project.name}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                          {project.serviceType || "Layanan"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden border border-slate-200/20 dark:border-zinc-700/25">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${progressValue}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                            {progressValue}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => router.push("/dashboard/admin/projects")}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-350 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {data.projects.length === 0 && (
              <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-sm italic">
                Belum ada proyek terbaru.
              </div>
            )}
          </div>
        </div>

        {/* SERVICES & HELP SIDEBAR */}
        <div className="space-y-6">
          {/* Layanan Aktif */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
            <h3 className="font-bold text-slate-800 dark:text-zinc-200 mb-4">
              Layanan Aktif
            </h3>
            <div className="space-y-3">
              {data.services.map((service, index) => {
                const isActive = service.isShown !== false;
                return (
                  <div
                    key={service._id || index}
                    className="flex items-center justify-between p-3.5 bg-slate-50/60 dark:bg-zinc-950/40 rounded-xl border border-slate-200 dark:border-zinc-800/80 hover:bg-slate-100/40 dark:hover:bg-zinc-950/80 transition-all duration-200"
                  >
                    <span className="font-bold text-slate-700 dark:text-zinc-300 text-xs">
                      {service.name || service.title}
                    </span>
                    {isActive ? (
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 animate-pulse">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                        Nonaktif
                      </span>
                    )}
                  </div>
                );
              })}
              {data.services.length === 0 && (
                <div className="text-center py-6 text-slate-400 dark:text-zinc-500 text-xs italic">
                  Belum ada layanan aktif.
                </div>
              )}
            </div>
            
            <button
              onClick={() => router.push("/dashboard/admin/service")}
              className="w-full mt-4 py-2.5 text-xs text-slate-600 dark:text-zinc-350 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 font-bold transition-all active:scale-[0.98] cursor-pointer"
            >
              Kelola Layanan
            </button>
          </div>

          {/* Banner Bantuan */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg hover:shadow-xl p-6 text-white relative overflow-hidden transition-all duration-300">
            <div className="absolute -right-8 -bottom-8 opacity-15 rotate-12 transition-transform duration-500 hover:scale-110">
              <BookOpen size={160} />
            </div>
            <div className="relative z-10 space-y-4">
              <div>
                <h3 className="font-black text-lg mb-1 tracking-tight">Butuh Bantuan?</h3>
                <p className="text-white/85 text-xs leading-relaxed max-w-[200px]">
                  Cek panduan pengoperasian sistem atau langkah pengelolaan fitur Cema Design.
                </p>
              </div>
              <button
                onClick={() => setIsDocOpen(true)}
                className="px-4.5 py-2.5 bg-white text-primary text-xs font-extrabold rounded-xl hover:bg-slate-50 hover:shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                Lihat Dokumentasi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- POPUP MODAL --- */}
      {isDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200 dark:border-zinc-800 transition-colors duration-300">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-100 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2 text-primary font-bold">
                {selectedFeature ? (
                  <button
                    onClick={() => setSelectedFeature(null)}
                    className="mr-2 p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={18} className="text-slate-600 dark:text-zinc-400" />
                  </button>
                ) : (
                  <BookOpen size={18} />
                )}
                <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  {selectedFeature
                    ? selectedFeature.title
                    : "Dokumentasi Fitur Admin"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-zinc-250 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {selectedFeature ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-primary-light/50 dark:bg-primary-dark/10 border border-primary/20 p-4 rounded-xl">
                    <p className="text-slate-700 dark:text-zinc-300 text-xs font-semibold leading-relaxed">
                      {selectedFeature.desc}
                    </p>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs uppercase tracking-wider">
                    Panduan & Langkah Pengoperasian:
                  </h4>
                  <ol className="relative border-l border-slate-200 dark:border-zinc-800/80 ml-3 space-y-6">
                    {selectedFeature.steps?.map((step: string, idx: number) => (
                      <li key={idx} className="ml-6">
                        <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/30">
                          <span className="text-primary text-xs font-bold">
                            {idx + 1}
                          </span>
                        </span>
                        <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="grid divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {docFeatures.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedFeature(item)}
                      className="py-4 px-3 hover:bg-slate-50 dark:hover:bg-zinc-800/30 rounded-xl transition-all cursor-pointer group flex justify-between items-center"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-bold text-slate-800 dark:text-zinc-200 mb-1 flex items-center gap-2 group-hover:text-primary transition-colors text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                          {item.title}
                        </h4>
                        <p className="text-slate-1000 dark:text-zinc-500 text-xs truncate">
                          {item.desc}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-zinc-500">
                        <ArrowLeft size={16} className="rotate-180 text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/50 flex justify-end gap-2">
              {selectedFeature && (
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="px-4 py-2 border border-slate-250 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-white dark:hover:bg-zinc-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Kembali ke Menu
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-slate-350 dark:hover:bg-zinc-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
