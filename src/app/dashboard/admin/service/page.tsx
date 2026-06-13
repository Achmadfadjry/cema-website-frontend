"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Trash2,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  fetchServicesAction,
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
} from "@/app/actions/service-actions";

// Tipe Data
interface ServiceItem {
  _id: string;
  id: string;
  title: string;
  category: string;
  price: string;
  description: string;
  image: string;
  isPopular: boolean;
  isShown: boolean;
  features: string[];
}

interface NotificationState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function ServicesPage() {
  const { data: session, status } = useSession();

  // --- STATE ---
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // State untuk Notifikasi (Toast)
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Form Data State
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    title: "",
    category: "",
    price: "0",
    isShown: true,
    image: "",
    description: "",
    features: [],
  });

  // --- FETCH DATA ---
  const fetchServices = async () => {
    if (status === "loading") return;

    setIsLoading(true);
    try {
      const result = await fetchServicesAction();
      if (result.success && result.data) {
        setServices(result.data);
      }
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchServices();
  }, [status]);

  // --- HANDLER UPLOAD IMAGE ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      showToast("File terlalu besar (Max 1MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // --- HANDLER SAVE (CREATE & UPDATE) ---
  const handleSave = async () => {
    if (!formData.title || !formData.category) {
      showToast("Nama layanan dan kategori wajib diisi!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        price: String(formData.price),
        description: formData.description || "-",
        image: formData.image || "",
        isShown: formData.isShown ?? true,
        isPopular: false,
        features: formData.features || [],
      };

      let result;
      if (isEditMode && editingServiceId) {
        // UPDATE mode
        result = await updateServiceAction(editingServiceId, payload);
      } else {
        // CREATE mode
        result = await createServiceAction(payload);
      }

      if (result.success) {
        setIsFormModalOpen(false);
        setIsEditMode(false);
        setEditingServiceId(null);
        setFormData({
          title: "",
          category: "",
          price: "0",
          isShown: true,
          image: "",
          description: "",
        });
        fetchServices();
        showToast(
          isEditMode
            ? "Layanan berhasil diperbarui!"
            : "Layanan berhasil disimpan!",
          "success"
        );
      } else {
        showToast(`Gagal menyimpan: ${result.message}`, "error");
      }
    } catch (error: any) {
      showToast("Gagal menyimpan data ke server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC HAPUS ---
  const openDeleteModal = (id: string) => {
    setServiceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setFormData({
      title: service.title,
      category: service.category,
      price: service.price,
      description: service.description,
      image: service.image,
      isShown: service.isShown,
      features: service.features,
    });
    setEditingServiceId(service.id);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    setIsLoading(true);
    try {
      const result = await deleteServiceAction(serviceToDelete);

      if (result.success) {
        setServices((prev) => prev.filter((s) => s.id !== serviceToDelete));
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
        showToast("Layanan berhasil dihapus!", "success");
      } else {
        showToast("Gagal menghapus: " + result.message, "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC TOGGLE STATUS ---
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isShown: !currentStatus } : s))
      );

      const service = services.find((s) => s.id === id);
      if (!service) return;

      const payload = {
        ...service,
        isShown: !currentStatus,
      };

      const result = await updateServiceAction(id, payload);

      if (!result.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isShown: currentStatus } : s))
        );
        showToast(`Gagal update status: ${result.message}`, "error");
      } else {
        showToast("Status publikasi layanan berhasil diubah!", "success");
      }
    } catch (error) {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isShown: currentStatus } : s))
      );
      showToast("Gagal koneksi ke server", "error");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Akses Ditolak. Silakan Login Ulang.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm gap-4 transition-colors duration-300">
        <div>
          <h3 className="font-black text-lg text-slate-800 dark:text-zinc-100 tracking-tight">
            Manajemen Layanan
          </h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
            Daftar Jasa Desain & Estimasi Harga Per Meter
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditMode(false);
            setEditingServiceId(null);
            setFormData({
              title: "",
              category: "",
              price: "0",
              isShown: true,
              image: "",
              description: "",
            });
            setIsFormModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Tambah Data
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Layanan</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-zinc-500 text-sm italic">
                    Belum ada data layanan yang tersimpan.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr
                    key={service._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-950 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex-shrink-0 flex items-center justify-center">
                          {service.image ? (
                            <img
                              src={service.image}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <UploadCloud className="text-slate-400 dark:text-zinc-650" size={16} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-zinc-200 text-base">
                            {service.title}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-zinc-500 truncate max-w-[200px] mt-0.5 leading-relaxed">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-600 dark:text-zinc-300 text-xs uppercase tracking-wider">
                      {service.category}
                    </td>

                    <td className="px-6 py-4 font-black text-slate-800 dark:text-zinc-200">
                      Rp {Number(service.price).toLocaleString("id-ID")}/m²
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleStatus(service.id, service.isShown)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            service.isShown ? "bg-primary" : "bg-slate-200 dark:bg-zinc-805"
                          }`}
                          title={service.isShown ? "Matikan Layanan" : "Aktifkan Layanan"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              service.isShown ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-95 cursor-pointer"
                          title="Ubah"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(service.id)}
                          className="p-2 text-red-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all active:scale-95 cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 transition-colors duration-300">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3 mb-5">
              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                {isEditMode ? "Ubah Layanan" : "Tambah Layanan Baru"}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Gambar Layanan
                </label>
                <div className="relative group mb-3">
                  <input
                    type="file"
                    id="service-image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="service-image-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-205 dark:border-zinc-800 rounded-xl p-4.5 bg-slate-50 dark:bg-zinc-950/40 hover:bg-slate-100/50 dark:hover:bg-zinc-900/40 hover:border-primary dark:hover:border-primary transition-all cursor-pointer text-center duration-200"
                  >
                    <UploadCloud size={24} className="text-slate-400 dark:text-zinc-500 mb-1.5 group-hover:text-primary transition-colors" />
                    <span className="text-[10.5px] text-slate-1000 dark:text-zinc-400 font-bold group-hover:text-primary">
                      Klik untuk upload foto layanan
                    </span>
                  </label>
                </div>
                {formData.image && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm transition-all duration-300">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-200 pointer-events-none">
                      <span className="text-white text-[10px] font-black uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded-lg">Preview Aktif</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Nama Layanan
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-medium"
                  placeholder="Contoh: Desain Interior"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-medium"
                  placeholder="Contoh: Design / Construction"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Harga
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-medium"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-medium h-24"
                  placeholder="Deskripsi singkat..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all shadow-md shadow-primary/20 disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 text-center transition-colors duration-300">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-650" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-zinc-100 tracking-tight">
              Hapus Layanan ini?
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 mb-6 leading-relaxed">
              Apakah Anda yakin? Data yang dihapus tidak bisa dikembalikan.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all cursor-pointer"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer"
                disabled={isLoading}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {notification.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-350">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold transition-all ${
              notification.type === "success"
                ? "bg-green-50 dark:bg-green-950/25 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950/25 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className="leading-tight">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
              className="ml-2 text-slate-400 hover:text-slate-655 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
