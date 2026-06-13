"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  X,
  Heart,
  ThumbsDown,
  ArrowRight,
  User,
  Lock,
  Mail,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { register, AuthServiceError } from "@/lib/services/auth.service";
import { login } from "@/lib/services/auth.service";

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
  relatedStyle: string; // Sesuaikan dengan field di Database Backend
}

// DATA STYLE DEFAULT (Fallback agar Result Page tetap muncul deskripsinya)
// Karena API saat ini hanya return Questions, kita perlu mapping info stylenya disini.
const DEFAULT_STYLES: DesignStyle[] = [
  {
    id: "Minimalist",
    name: "Minimalist",
    description:
      'Anda menyukai kesederhanaan, garis bersih, palet warna monokrom, dan ruang yang tidak berantakan. "Less is more" adalah mantra Anda.',
  },
  {
    id: "Industrial",
    name: "Industrial",
    description:
      "Anda tertarik pada ekspos material mentah seperti bata, beton, dan pipa logam. Gaya ini menggabungkan elemen vintage dengan nuansa maskulin.",
  },
  {
    id: "Modern",
    name: "Modern Futuristik",
    description:
      "Anda menyukai teknologi, bentuk geometris yang tegas, material kaca dan baja, serta pencahayaan LED yang dramatis.",
  },
  {
    id: "Scandinavian",
    name: "Scandinavian",
    description:
      "Anda mengutamakan kenyamanan (Hygge), pencahayaan alami, material kayu terang, dan fungsionalitas yang hangat.",
  },
];

export default function DesignQuizUser() {
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"intro" | "quiz" | "result" | "auth">(
    "intro",
  );
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Data Kuis
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Progress User
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [winnerStyle, setWinnerStyle] = useState<DesignStyle | null>(null);

  // --- AUTH FORM STATE ---
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // --- LOAD DATA DARI BACKEND API ---
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!API_URL) return;

      try {
        const res = await fetch(`${API_URL}/quiz-questions`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const responseJson = await res.json();
          // Handle struktur { data: [...] } atau [...]
          if (responseJson.data && Array.isArray(responseJson.data)) {
            setQuestions(responseJson.data);
          } else if (Array.isArray(responseJson)) {
            setQuestions(responseJson);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data kuis:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchQuestions();
  }, []);

  // --- LOGIKA KUIS ---

  const startQuiz = () => {
    if (isLoadingData) return;

    if (questions.length === 0) {
      alert("Mohon maaf, sistem kuis sedang pemeliharaan (Data Kosong).");
      return;
    }
    setIsOpen(true);
    setStep("quiz");
    setCurrentQIndex(0);
    setScores({});
  };

  const handleAnswer = (liked: boolean) => {
    const currentQ = questions[currentQIndex];

    if (liked) {
      // Backend menggunakan field 'relatedStyle'
      const styleId = currentQ.relatedStyle;
      setScores((prev) => ({
        ...prev,
        [styleId]: (prev[styleId] || 0) + 1,
      }));
    }

    // Cek apakah ini pertanyaan terakhir
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    // Cari skor tertinggi
    let maxScore = -1;
    let winningStyleId = "";

    // Hitung berdasarkan styles yang terdeteksi di score
    Object.keys(scores).forEach((styleId) => {
      if (scores[styleId] > maxScore) {
        maxScore = scores[styleId];
        winningStyleId = styleId;
      }
    });

    // Jika user tidak menyukai apapun (score kosong), ambil default pertama
    if (Object.keys(scores).length === 0 && questions.length > 0) {
      winningStyleId = questions[0].relatedStyle;
    }

    // Cari detail style dari DEFAULT_STYLES
    // Jika tidak ketemu di default, buat objek temporary agar tidak error
    let winner = DEFAULT_STYLES.find((s) => s.id === winningStyleId);

    if (!winner) {
      winner = {
        id: winningStyleId,
        name: winningStyleId, // Fallback pakai ID jika nama tidak ada
        description:
          "Gaya desain unik yang sesuai dengan preferensi visual pilihan Anda.",
      };
    }

    setWinnerStyle(winner);
    setStep("result");
  };

  // --- AUTH HANDLER ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    try {
      if (authMode === "register") {
        // 1. Register the new account
        await register({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          role: "client",
        });
      }

      // 2. Auto-login via NextAuth (same as login page)
      const result = await signIn("credentials", {
        email: authForm.email,
        password: authForm.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError(
          authMode === "register"
            ? "Akun berhasil dibuat, tapi login gagal. Silakan login manual."
            : "Email atau password salah.",
        );
      } else if (result?.ok) {
        setAuthSuccess(
          authMode === "register"
            ? "Akun dibuat & login berhasil! Mengalihkan ke dashboard..."
            : "Login berhasil! Mengalihkan ke dashboard...",
        );
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    } catch (err) {
      if (err instanceof AuthServiceError) {
        setAuthError(err.message);
      } else {
        setAuthError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // --- RENDER COMPONENT ---

  return (
    <>
      {/* 1. CARD TRIGGER (TOMBOL MULAI DI LANDING PAGE) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.05 }}
        onClick={startQuiz}
        className="bg-[#BC5D60] text-white p-12 rounded-lg cursor-pointer shadow-xl text-center relative z-10"
      >
        <ClipboardCheck size={64} className="mx-auto mb-6" />
        <h2 className="text-white mb-4 text-2xl font-bold">
          Tidak Yakin Gaya Desain Anda?
        </h2>
        <p className="mb-8 opacity-90 text-lg">
          Ikuti quiz interaktif kami untuk menemukan gaya desain yang sempurna
          sesuai kepribadian dan kebutuhan Anda.
        </p>
        <motion.div
          className="inline-flex items-center gap-2 text-lg px-8 py-3 bg-white text-[#BC5D60] rounded-lg font-bold"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoadingData ? (
            <>
              Memuat Data <Loader2 className="animate-spin" size={20} />
            </>
          ) : (
            <>
              Mulai Quiz <ArrowRight size={24} />
            </>
          )}
        </motion.div>
      </motion.div>

      {/* 2. MODAL POPUP */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Gelap */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] overflow-hidden relative z-10 flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
            {/* Tombol Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {/* --- VIEW: QUIZ --- */}
            {step === "quiz" && questions[currentQIndex] && (
              <>
                {/* Kiri: Gambar */}
                <div className="w-full md:w-1/2 h-64 md:h-full bg-gray-100 relative">
                  <img
                    src={
                      questions[currentQIndex].imageUrl ||
                      "https://via.placeholder.com/400"
                    }
                    alt="Quiz"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                    Pertanyaan {currentQIndex + 1} dari {questions.length}
                  </div>
                </div>

                {/* Kanan: Pertanyaan & Aksi */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-center bg-white">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {questions[currentQIndex].text}
                  </h3>
                  <p className="text-gray-500 mb-10 text-sm">
                    Apakah gaya ruangan ini sesuai dengan selera Anda?
                  </p>

                  <div className="flex gap-6 w-full max-w-xs">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 transition-all group"
                    >
                      <div className="bg-red-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                        <ThumbsDown size={24} />
                      </div>
                      <span className="font-medium text-sm">Kurang Suka</span>
                    </button>

                    <button
                      onClick={() => handleAnswer(true)}
                      className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-green-100 text-green-500 hover:bg-green-50 hover:border-green-200 transition-all group"
                    >
                      <div className="bg-green-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                        <Heart size={24} fill="currentColor" />
                      </div>
                      <span className="font-medium text-sm">Suka Banget</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* --- VIEW: RESULT --- */}
            {step === "result" && winnerStyle && (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-blue-50 to-white relative">
                {/* Confetti Effect */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />

                <span className="text-[#8cc55a] font-bold tracking-wider text-sm uppercase mb-2">
                  Hasil Analisa AI
                </span>
                <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
                  {winnerStyle.name}
                </h2>
                <p className="text-gray-600 max-w-lg mb-8 leading-relaxed">
                  {winnerStyle.description}
                </p>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-md w-full mb-8">
                  <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock size={16} className="text-yellow-500" />
                    Simpan Hasil Ini?
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Simpan preferensi ini ke akun Anda agar desainer kami bisa
                    langsung mengetahuinya.
                  </p>
                  <button
                    onClick={() => setStep("auth")}
                    className="w-full bg-[#8cc55a] text-white py-3 rounded-lg font-bold hover:bg-[#588C1C] transition-colors shadow-blue-200 shadow-lg"
                  >
                    Simpan Preferensi & Daftar
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  Tutup tanpa menyimpan
                </button>
              </div>
            )}

            {/* --- VIEW: AUTH (Register/Login) --- */}
            {step === "auth" && (
              <div className="w-full h-full flex">
                {/* Kiri: Info */}
                <div className="hidden md:flex w-1/2 bg-[#8cc55a] text-white p-10 flex-col justify-center">
                  <h3 className="text-3xl font-bold mb-4">
                    {authMode === "register"
                      ? "Satu Langkah Lagi!"
                      : "Selamat Datang Kembali!"}
                  </h3>
                  <p className="opacity-90 mb-8">
                    {authMode === "register" ? (
                      <>
                        Buat akun untuk menyimpan hasil kuis gaya{" "}
                        <strong>{winnerStyle?.name}</strong> Anda. Ini akan
                        sangat membantu tim desainer kami.
                      </>
                    ) : (
                      "Masuk ke akun Anda untuk menyimpan hasil kuis."
                    )}
                  </p>
                  <div className="space-y-4 text-sm opacity-80">
                    <div className="flex items-center gap-2">
                      ✓ Simpan Referensi Desain
                    </div>
                    <div className="flex items-center gap-2">
                      ✓ Konsultasi Gratis
                    </div>
                    <div className="flex items-center gap-2">
                      ✓ Estimasi Biaya Proyek
                    </div>
                  </div>
                </div>

                {/* Kanan: Form */}
                <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {authMode === "register"
                      ? "Daftar Akun Baru"
                      : "Masuk ke Akun"}
                  </h3>

                  {/* Error / Success banners */}
                  {authError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {authError}
                    </div>
                  )}
                  {authSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                      {authSuccess}
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleAuthSubmit}>
                    {/* Nama hanya untuk Register */}
                    {authMode === "register" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Nama Lengkap
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-3 text-gray-400"
                            size={18}
                          />
                          <input
                            type="text"
                            required
                            value={authForm.name}
                            onChange={(e) =>
                              setAuthForm({ ...authForm, name: e.target.value })
                            }
                            className="w-full border border-gray-300 pl-10 p-3 rounded-lg focus:ring-2 focus:ring-[#8cc55a] outline-none"
                            placeholder="John Doe"
                            disabled={authLoading}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-3 text-gray-400"
                          size={18}
                        />
                        <input
                          type="email"
                          required
                          value={authForm.email}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, email: e.target.value })
                          }
                          className="w-full border border-gray-300 pl-10 p-3 rounded-lg focus:ring-2 focus:ring-[#8cc55a] outline-none"
                          placeholder="email@contoh.com"
                          disabled={authLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-3 text-gray-400"
                          size={18}
                        />
                        <input
                          type="password"
                          required
                          value={authForm.password}
                          onChange={(e) =>
                            setAuthForm({
                              ...authForm,
                              password: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 pl-10 p-3 rounded-lg focus:ring-2 focus:ring-[#8cc55a] outline-none"
                          placeholder="••••••••"
                          disabled={authLoading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-[#8cc55a] text-white py-3 rounded-lg font-bold hover:bg-[#588C1C] transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />{" "}
                          Memproses...
                        </>
                      ) : authMode === "register" ? (
                        "Daftar & Simpan Hasil"
                      ) : (
                        "Login & Simpan Hasil"
                      )}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-500 mt-6">
                    {authMode === "register"
                      ? "Sudah punya akun?"
                      : "Belum punya akun?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(
                          authMode === "register" ? "login" : "register",
                        );
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className="text-[#8cc55a] font-bold hover:underline"
                    >
                      {authMode === "register"
                        ? "Login disini"
                        : "Daftar disini"}
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
