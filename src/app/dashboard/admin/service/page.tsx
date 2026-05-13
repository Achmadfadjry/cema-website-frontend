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

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- FETCH DATA ---
  const fetchServices = async () => {
    // Only fetch if session is loaded (even if unauthenticated, middleware might redirect, but safe to check)
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
      console.error("File terlalu besar (Max 1MB)");
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
    if (!formData.title || !formData.category) return;

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        price: String(formData.price),
        description: formData.description || "-",
        image: formData.image,
        isShown: formData.isShown,
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
        console.error("Gagal simpan:", result.message);
        showToast(`Gagal menyimpan: ${result.message}`, "error");
      }
    } catch (error: any) {
      console.error("Error saving:", error);
      showToast("Gagal menyimpan data ke server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC HAPUS (FIXED) ---
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
    // 1. Cek ID
    if (!serviceToDelete) return;

    setIsLoading(true);
    try {
      const result = await deleteServiceAction(serviceToDelete);

      if (result.success) {
        // Update Tampilan (Hapus baris dari tabel)
        setServices((prev) => prev.filter((s) => s.id !== serviceToDelete));

        // Tutup Modal
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
      } else {
        console.error("Gagal hapus:", result.message);
        showToast("Gagal menghapus: " + result.message, "error");
      }
    } catch (error) {
      console.error("Error connection deleting:", error);
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC TOGGLE STATUS (NEW) ---
  // --- LOGIC TOGGLE STATUS (NEW) ---
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic Update
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isShown: !currentStatus } : s))
      );

      // Kami berasumsi endpoint PUT /services/:id bisa menerima parsial update
      // Sesuaikan body dengan kebutuhan backend
      // Disini kita kirim payload lengkap atau partial tergantung API
      // Untuk aman, kita ambil data service yang ada
      const service = services.find((s) => s.id === id);
      if (!service) return;

      const payload = {
        ...service,
        isShown: !currentStatus,
      };

      const result = await updateServiceAction(id, payload);

      if (!result.success) {
        // Revert changes if failed
        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isShown: currentStatus } : s))
        );
        showToast(`Gagal update status: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error toggle status:", error);
      // Revert
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isShown: currentStatus } : s))
      );
      showToast("Gagal koneksi ke server", "error");
    }
  };

  if (status === "loading")
    return (
      <div className="p-10 text-center text-gray-800">Loading session...</div>
    );
  if (status === "unauthenticated")
    return <div className="p-10 text-center text-red-500">Akses Ditolak.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900">Manajemen Layanan</h3>
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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Tambah Data
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-900 uppercase bg-gray-100 border-b font-bold">
              <tr>
                <th className="px-6 py-3">Layanan</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Harga</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Data kosong.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr
                    key={service._id}
                    className="bg-white hover:bg-gray-50 transition-colors"
                  >
                    {/* KOLOM 1: Layanan */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded border overflow-hidden flex-shrink-0">
                          {service.image ? (
                            <img
                              src={service.image}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <UploadCloud size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          {/* FIX TEXT COLOR: text-gray-900 */}
                          <div className="font-bold text-gray-900 text-base">
                            {service.title}
                          </div>
                          <div className="text-sm text-gray-600 truncate max-w-[150px]">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* KOLOM 2: Kategori */}
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {service.category}
                    </td>

                    {/* KOLOM 3: Harga */}
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      Rp {Number(service.price).toLocaleString("id-ID")}
                    </td>

                    {/* KOLOM 4: Status */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          handleToggleStatus(service.id, service.isShown)
                        }
                        className={`inline-block px-3 py-1 rounded text-xs font-bold transition-all ${
                          service.isShown
                            ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {service.isShown ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>

                    {/* KOLOM 5: Aksi */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openEditModal(service)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors mr-1"
                        title="Ubah"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(service.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">
                {isEditMode ? "Edit Layanan" : "Tambah Layanan"}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)}>
                <X size={20} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  Gambar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"
                />
              </div>

              {/* INPUT FIELDS dengan Text-Gray-900 agar tidak ghosting */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  Nama Layanan
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border p-2 rounded text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Desain Interior"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  Kategori
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border p-2 rounded text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Design"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  Harga
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full border p-2 rounded text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border p-2 rounded text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Deskripsi singkat..."
                  rows={3}
                ></textarea>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-white"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">
                Hapus Layanan Ini?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Apakah Anda yakin? Data yang dihapus tidak bisa dikembalikan.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {notification.show && (
        <div
          className={`fixed bottom-10 right-10 px-6 py-4 rounded-lg shadow-xl border flex items-center gap-3 animate-in slide-in-from-right duration-300 z-[100] ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={24} className="text-green-600" />
          ) : (
            <AlertCircle size={24} className="text-red-600" />
          )}
          <div>
            <h4 className="font-bold text-sm">
              {notification.type === "success" ? "Berhasil" : "Gagal"}
            </h4>
            <p className="text-sm">{notification.message}</p>
          </div>
          <button
            onClick={() =>
              setNotification((prev) => ({ ...prev, show: false }))
            }
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
