"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Save,
  Plus,
  Trash2,
  LayoutTemplate,
  HelpCircle,
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  fetchQuizQuestionsAction,
  saveQuizQuestionsAction,
  deleteQuizQuestionAction,
  createQuizQuestionAction,
} from "@/app/actions/design-quiz-actions";

// --- KONFIGURASI API ---
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- TIPE DATA ---
interface DesignStyle {
  id: string;
  name: string;
  description: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  imageUrl: string;
  relatedStyle: string;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

interface ConfirmModalState {
  show: boolean;
  type: "style" | "question" | null;
  id: string | null;
}

export default function DesignQuizAdmin() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Style (Local Storage)
  const [styles, setStyles] = useState<DesignStyle[]>([
    {
      id: "Minimalist",
      name: "Minimalist",
      description: "Gaya desain sederhana dan fungsional.",
    },
    {
      id: "Industrial",
      name: "Industrial",
      description: "Gaya ekspos material mentah.",
    },
  ]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<"styles" | "questions">("styles");

  // State untuk Notifikasi (Toast)
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "success",
  });

  // State untuk Modal Konfirmasi
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    type: null,
    id: null,
  });

  // Helper menampilkan notifikasi
  const showToast = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- LOAD DATA (GET) ---
  useEffect(() => {
    if (status === "loading") return;

    // Load Styles (Local)
    const savedStyles = localStorage.getItem("quizStyles");
    if (savedStyles) setStyles(JSON.parse(savedStyles));

    // Load Questions (API)
    const fetchQuestions = async () => {
      if (!API_URL) return;
      setIsDataLoading(true);
      const result = await fetchQuizQuestionsAction();
      if (result.success && result.data) {
        setQuestions(result.data);
      }
      setIsDataLoading(false);
    };

    fetchQuestions();
  }, [status]);

  // --- HANDLERS ---

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // 1. Simpan Styles ke LocalStorage
      localStorage.setItem("quizStyles", JSON.stringify(styles));

      // 2. Simpan Perubahan ke API
      const currentQuestions = Array.isArray(questions) ? questions : [];
      const result = await saveQuizQuestionsAction(currentQuestions);

      if (result.success) {
        showToast(result.message || "Data berhasil disimpan ke server!", "success");
      } else {
        showToast(result.message || "Gagal menyimpan data", "error");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      showToast(`Gagal menyimpan: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const initiateDelete = (type: "style" | "question", id: string) => {
    setConfirmModal({ show: true, type, id });
  };

  const executeDelete = async () => {
    const { type, id } = confirmModal;
    if (!id) return;

    if (type === "style") {
      setStyles(styles.filter((s) => s.id !== id));
      showToast("Kategori style berhasil dihapus.", "success");
    } else if (type === "question") {
      const currentQuestions = Array.isArray(questions) ? questions : [];
      setQuestions(currentQuestions.filter((q) => q.id !== id));

      const result = await deleteQuizQuestionAction(id);
      if (result.success) {
        showToast(result.message || "Pertanyaan berhasil dihapus.", "success");
      } else {
        showToast(result.message || "Gagal menghapus data di server.", "error");
      }
    }

    setConfirmModal({ show: false, type: null, id: null });
  };

  const addStyle = () => {
    const newStyle: DesignStyle = {
      id: `style_${Date.now()}`,
      name: "",
      description: "",
    };
    setStyles([...styles, newStyle]);
  };

  const updateStyle = (id: string, field: keyof DesignStyle, value: string) => {
    setStyles(styles.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addQuestion = async () => {
    const newId = Date.now().toString();
    const defaultStyle = styles.length > 0 ? styles[0].id : "";

    const newQ: QuizQuestion = {
      id: newId,
      text: "Apakah kamu menyukai desain ini?",
      imageUrl: "",
      relatedStyle: defaultStyle,
    };

    setQuestions([...(Array.isArray(questions) ? questions : []), newQ]);

    const result = await createQuizQuestionAction(newQ);
    if (!result.success) {
      showToast(result.message || "Gagal koneksi ke server.", "error");
    }
  };

  const updateQuestion = (
    id: string,
    field: keyof QuizQuestion,
    value: string
  ) => {
    const currentQuestions = Array.isArray(questions) ? questions : [];
    setQuestions(
      currentQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleImageUpload = (id: string, file: File) => {
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      showToast("File terlalu besar! Maksimal 1MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateQuestion(id, "imageUrl", base64String);
    };
    reader.readAsDataURL(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(id, e.target.files[0]);
    }
  };

  const onDropHandler = (e: React.DragEvent<HTMLLabelElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(id, e.dataTransfer.files[0]);
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm gap-4 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary border border-primary/20 shrink-0">
            <LayoutTemplate size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-zinc-100 tracking-tight">
              Pengaturan Kuis Preferensi
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              Buat Pertanyaan Visual Untuk Mengidentifikasi Selera Klien
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:bg-primary/50 disabled:cursor-not-allowed self-start sm:self-auto"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Simpan Data
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab("styles")}
          className={`pb-3 px-5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === "styles"
              ? "text-primary border-primary"
              : "text-slate-400 dark:text-zinc-500 border-transparent hover:text-slate-600 dark:hover:text-zinc-300"
            }`}
        >
          1. Atur Kategori Desain (Hasil)
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`pb-3 px-5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === "questions"
              ? "text-primary border-primary"
              : "text-slate-400 dark:text-zinc-500 border-transparent hover:text-slate-600 dark:hover:text-zinc-300"
            }`}
        >
          2. Atur Pertanyaan & Gambar
        </button>
      </div>

      {/* TAB 1: MANAGEMEN STYLE / KATEGORI */}
      {activeTab === "styles" && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6 transition-colors duration-300">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
              Daftar Rekomendasi Gaya Desain
            </h4>
            <button
              onClick={addStyle}
              className="text-xs font-bold flex items-center gap-1 text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <Plus size={14} /> Tambah Style
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {styles.map((style, index) => (
              <div
                key={style.id}
                className="flex gap-4 p-4 border border-slate-100 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 relative group"
              >
                <div className="bg-primary/10 dark:bg-primary/20 text-primary w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs shrink-0 border border-primary/25">
                  {index + 1}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
                  <div className="md:col-span-1">
                    <label className="block text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      Nama Style (ID)
                    </label>
                    <input
                      type="text"
                      value={style.name}
                      onChange={(e) =>
                        updateStyle(style.id, "name", e.target.value)
                      }
                      placeholder="Contoh: Modern"
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      Deskripsi Singkat
                    </label>
                    <input
                      type="text"
                      value={style.description}
                      onChange={(e) =>
                        updateStyle(style.id, "description", e.target.value)
                      }
                      placeholder="Deskripsi kategori..."
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  onClick={() => initiateDelete("style", style.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-xl transition-all self-start cursor-pointer active:scale-95"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {styles.length === 0 && (
            <p className="text-center text-slate-400 dark:text-zinc-500 py-12 text-xs italic">
              Belum ada kategori style. Silahkan tambah baru.
            </p>
          )}
        </div>
      )}

      {/* TAB 2: MANAGEMEN PERTANYAAN */}
      {activeTab === "questions" && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6 transition-colors duration-300">

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-4 rounded-xl text-xs text-amber-800 dark:text-amber-400 flex gap-3 leading-relaxed">
            <HelpCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Logika Kuis Preferensi:</strong> Setiap pertanyaan bergambar di bawah ini akan ditampilkan secara interaktif pada form quiz pengguna. Jika user memilih <span className="font-bold">"Suka"</span> pada gambar tertentu, sistem akan menambahkan poin ke Kategori Style Terkait yang dipilih.
            </div>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
              Daftar Pertanyaan Gambar
            </h4>
            <button
              onClick={addQuestion}
              className="text-xs font-bold flex items-center gap-1 text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <Plus size={14} /> Tambah Pertanyaan
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {Array.isArray(questions) && questions.length > 0 ? (
              questions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-5 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:shadow-sm transition-all bg-slate-50/30 dark:bg-zinc-950/30"
                >
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Kolom Kiri: Upload Drag & Drop */}
                    <div className="w-full md:w-1/4">
                      <label
                        className="aspect-square bg-white dark:bg-zinc-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-800 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer hover:bg-primary-light/30 hover:border-primary dark:hover:bg-zinc-800 transition-colors"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => onDropHandler(e, q.id)}
                      >
                        {q.imageUrl ? (
                          <>
                            <img
                              src={q.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                              Ganti Gambar
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-3">
                            <UploadCloud className="mx-auto text-slate-400 dark:text-zinc-500 mb-2 group-hover:text-primary transition-colors" size={24} />
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold group-hover:text-primary block leading-tight">
                              Klik / Tarik Foto
                            </span>
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => onFileSelect(e, q.id)}
                        />
                      </label>
                    </div>

                    {/* Kolom Kanan: Detail Pertanyaan */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/60 pb-2">
                        <span className="font-black text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">
                          Pertanyaan #{index + 1}
                        </span>
                        <button
                          onClick={() => initiateDelete("question", q.id)}
                          className="text-red-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer active:scale-95 font-bold"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>

                      <div className="text-xs font-bold">
                        <label className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                          Teks Pertanyaan
                        </label>
                        <input
                          type="text"
                          className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all font-medium text-xs"
                          value={q.text}
                          onChange={(e) =>
                            updateQuestion(q.id, "text", e.target.value)
                          }
                        />
                      </div>

                      <div className="bg-primary-light/30 dark:bg-primary-dark/10 p-3.5 rounded-xl border border-primary/20 text-xs font-bold">
                        <label className="block text-[10px] text-primary mb-1.5 uppercase tracking-wider">
                          Rekomendasikan Style:
                        </label>
                        <select
                          className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/45 outline-none text-slate-800 dark:text-zinc-200 font-medium cursor-pointer bg-white"
                          value={q.relatedStyle}
                          onChange={(e) =>
                            updateQuestion(q.id, "relatedStyle", e.target.value)
                          }
                        >
                          <option value="">-- Pilih Kategori Style --</option>
                          {styles.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 dark:text-zinc-500 text-center py-12 text-xs italic">
                Belum ada data pertanyaan. Silahkan buat pertanyaan baru.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-350">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold transition-all ${notification.type === "success"
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
              className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 text-center transition-colors duration-300">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-zinc-100 tracking-tight">
              Hapus Item Kuis?
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus{" "}
              {confirmModal.type === "style" ? "kategori style" : "pertanyaan kuis"} ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmModal({ show: false, type: null, id: null })}
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
    </div>
  );
}
