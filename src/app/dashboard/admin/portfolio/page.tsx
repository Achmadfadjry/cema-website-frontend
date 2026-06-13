"use client";

import { useState, useEffect } from "react";
import type { Portfolio } from "@/lib/types";
import {
  fetchPortfoliosAction,
  createPortfolioAction,
  updatePortfolioAction,
  updatePortfolioStatusAction,
  deletePortfolioAction,
} from "@/app/actions/portfolio-actions";
import { Trash2, Plus, Eye, EyeOff, Loader2, Pencil, X, UploadCloud } from "lucide-react";

// Ambil Base URL dari Env
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simpan File asli untuk diupload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    id: "",
    displayName: "",
    category: "Residential",
    description: "",
    endDate: new Date().toISOString().split("T")[0],
    isShown: false,
    photoUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Helper untuk menangani URL gambar
  const getImageUrl = (photoUrl: string) => {
    if (!photoUrl) return "https://placehold.co/600x400?text=No+Image";
    if (photoUrl.startsWith("data:")) return photoUrl;
    if (photoUrl.startsWith("http")) return photoUrl;
    const baseUrl = API_URL.replace(/\/api$/, "");
    return `${baseUrl}/uploads/${photoUrl}`;
  };

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const result = await fetchPortfoliosAction();

      if (result.success && result.data) {
        setPortfolios(result.data);
        setError(null);
      } else {
        setError(result.message || "Gagal memuat data portfolio.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat data portfolio. Pastikan backend sudah jalan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File terlalu besar (Max 2MB)");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormData({
      id: "",
      displayName: "",
      category: "Residential",
      description: "",
      endDate: new Date().toISOString().split("T")[0],
      isShown: false,
      photoUrl: "",
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!formData.displayName || !formData.description || !formData.category) {
      return alert("Mohon isi semua field yang wajib");
    }

    try {
      setIsSubmitting(true);

      const dataToSend = new FormData();
      dataToSend.append("displayName", formData.displayName);
      dataToSend.append("category", formData.category);
      dataToSend.append("description", formData.description);
      dataToSend.append("endDate", formData.endDate);
      dataToSend.append("isShown", String(formData.isShown));

      if (selectedFile) {
        dataToSend.append("photo", selectedFile);
      }

      let result;
      if (isEditing) {
        result = await updatePortfolioAction(formData.id, dataToSend);
      } else {
        result = await createPortfolioAction(dataToSend);
      }

      if (result.success) {
        await fetchPortfolios();
        setIsModalOpen(false);
        resetForm();
      } else {
        alert(result.message || "Gagal menyimpan portfolio");
      }
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan portfolio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus portfolio ini?")) {
      try {
        const result = await deletePortfolioAction(id);
        if (result.success) {
          setPortfolios(portfolios.filter((p) => p.id !== id));
        } else {
          alert(result.message || "Gagal menghapus portfolio");
        }
      } catch (err) {
        alert("Gagal menghapus portfolio");
      }
    }
  };

  const toggleHomepage = async (portfolio: Portfolio) => {
    try {
      const payload = {
        ...portfolio,
        isShown: !portfolio.isShown,
      };

      const updated = { ...portfolio, isShown: !portfolio.isShown };
      setPortfolios(
        portfolios.map((p) => (p.id === portfolio.id ? updated : p))
      );

      const result = await updatePortfolioStatusAction(portfolio.id, payload);

      if (!result.success) {
        setPortfolios(
          portfolios.map((p) => (p.id === portfolio.id ? portfolio : p))
        );
        alert(result.message || "Gagal mengupdate status");
      }
    } catch (err) {
      setPortfolios(
        portfolios.map((p) => (p.id === portfolio.id ? portfolio : p))
      );
      alert("Gagal mengupdate status");
    }
  };

  const openEditModal = (portfolio: Portfolio) => {
    setFormData({
      id: portfolio.id,
      displayName: portfolio.displayName,
      category: portfolio.category,
      description: portfolio.description,
      endDate: new Date(portfolio.endDate).toISOString().split("T")[0],
      isShown: portfolio.isShown,
      photoUrl: portfolio.photoUrl,
    });

    setPreviewUrl(getImageUrl(portfolio.photoUrl));
    setIsEditing(true);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm gap-4 transition-colors duration-300">
        <div>
          <h3 className="font-black text-lg text-slate-800 dark:text-zinc-100 tracking-tight">
            Kelola Portfolio
          </h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
            {portfolios.filter((p) => p.isShown).length} Tampil di Halaman Utama
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Tambah Portfolio
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200/50 dark:border-red-900/30 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Grid Portfolio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300"
          >
            <div className="relative h-52 bg-slate-50 dark:bg-zinc-950 overflow-hidden">
              <img
                src={getImageUrl(item.photoUrl)}
                alt={item.displayName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600x400?text=No+Image";
                }}
              />
              {/* Overlays on hover */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-700 dark:text-zinc-200 shadow-md transition-all active:scale-95 cursor-pointer"
                  title="Ubah Portofolio"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 text-red-600 shadow-md transition-all active:scale-95 cursor-pointer"
                  title="Hapus Portofolio"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 truncate pr-2 text-base">
                  {item.displayName}
                </h4>
                <span className="text-[9px] uppercase tracking-widest px-2.5 py-1 bg-primary-light dark:bg-primary-dark/20 text-primary dark:text-primary-hover font-black rounded-lg shrink-0">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mb-4 h-8 leading-relaxed">
                {item.description}
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={() => toggleHomepage(item)}
                  className={`text-[10px] flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    item.isShown
                      ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30"
                      : "bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-750"
                  }`}
                >
                  {item.isShown ? <Eye size={12} /> : <EyeOff size={12} />}
                  {item.isShown ? "Visible" : "Hidden"}
                </button>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2 py-1 rounded-lg">
                  {new Date(item.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {portfolios.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400 dark:text-zinc-500 font-medium">
            Belum ada data portfolio yang tersimpan.
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 scrollbar-thin transition-colors duration-300">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3 mb-5">
              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                {isEditing ? "Update Portfolio" : "Create New Project"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Judul Project
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-medium"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  placeholder="Contoh: Modern House Design"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Kategori
                </label>
                <select
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-medium cursor-pointer"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Interior">Interior</option>
                  <option value="Architecture">Architecture</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Deskripsi
                </label>
                <textarea
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-medium h-24"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Berikan deskripsi singkat tentang portofolio..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-medium cursor-pointer"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 cursor-pointer bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-slate-200 dark:border-zinc-800 focus:ring-primary/40"
                      checked={formData.isShown}
                      onChange={(e) =>
                        setFormData({ ...formData, isShown: e.target.checked })
                      }
                    />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400">
                      Tampilkan di Beranda
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Foto Project
                </label>
                <div className="relative group mb-3">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-205 dark:border-zinc-800 rounded-xl p-4.5 bg-slate-50 dark:bg-zinc-950/40 hover:bg-slate-100/50 dark:hover:bg-zinc-900/40 hover:border-primary dark:hover:border-primary transition-all cursor-pointer text-center duration-200"
                  >
                    <UploadCloud size={24} className="text-slate-400 dark:text-zinc-500 mb-1.5 group-hover:text-primary transition-colors" />
                    <span className="text-[10.5px] text-slate-1000 dark:text-zinc-400 font-bold group-hover:text-primary">
                      Klik untuk upload foto project
                    </span>
                  </label>
                </div>
                {previewUrl && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm transition-all duration-300">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-200 pointer-events-none">
                      <span className="text-white text-[10px] font-black uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded-lg">Preview Aktif</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all shadow-md shadow-primary/20 disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEditing ? "Update Project" : "Simpan Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
