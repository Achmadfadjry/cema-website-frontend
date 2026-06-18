"use client";
import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, MapPin, Send, CheckCircle, XCircle } from "lucide-react";
import "./contact.css";

export default function ContactPage() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);

  // State untuk Toast Pop-up
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // 'success' | 'error'
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    subject: "Tentang Desain Rumah",
    message: "",
  });

  // Fungsi untuk menampilkan Toast
  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, message, type });

    // Sembunyikan otomatis setelah 3 detik
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const token = recaptchaRef.current?.getValue();

    if (!token) {
      showToast("Silakan selesaikan reCAPTCHA terlebih dahulu", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, captchaToken: token }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showToast("Pesan berhasil dikirim!", "success");
        // Reset form & captcha
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          subject: "Tentang Desain Rumah",
          message: "",
        });
        recaptchaRef.current?.reset();
      } else {
        showToast("Gagal mengirim pesan. Silakan coba lagi.", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Terjadi kesalahan. Silakan periksa koneksi Anda.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen pt-32 pb-16 lg:pt-40 lg:pb-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 overflow-hidden">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-28 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-white font-medium ${toast.type === "success"
              ? "bg-emerald-600 border-emerald-500"
              : "bg-rose-600 border-rose-500"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Ornaments */}
      <div className="fixed top-0 right-0 w-[280px] sm:w-[350px] md:w-[450px] opacity-40 pointer-events-none z-0">
        <img
          src="/images/right-up-bg.png"
          alt="right-up-bg"
          className="w-full h-auto object-contain"
        />
      </div>
      <div className="fixed bottom-0 left-0 w-[300px] sm:w-[400px] md:w-[500px] opacity-40 pointer-events-none z-0">
        <img
          src="/images/bg-contact-us.png"
          alt="left-bottom-bg"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Glassmorphic glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#8cc55a]/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#8cc55a]/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-[#8cc55a]/10 text-[#5b8e34] font-semibold text-sm rounded-full mb-4 border border-[#8cc55a]/20">
            Hubungi Kami
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight mb-4">
            Hubungi Kami
          </h1>
          <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Ada pertanyaan atau saran? Silakan kirim pesan kepada kami!
          </p>
        </motion.div>

        {/* Form and Info Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Contact Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 bg-gradient-to-br from-[#8cc55a] to-[#5b8e34] text-white rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]"
          >
            {/* Background decorative elements */}
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute top-10 right-10 w-24 h-24 bg-white/5 rounded-full blur-md pointer-events-none" />
            <div className="absolute bottom-24 right-24 w-12 h-12 bg-white/15 rounded-full pointer-events-none" />

            {/* Extra background ornament if exists */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 pointer-events-none opacity-25 mix-blend-overlay">
              <img
                src="/images/bottom-right-bg.png"
                alt="bg-bottom-right"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info Header */}
            <div className="relative z-10">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Informasi Kontak
              </h2>
              <p className="text-white/80 font-light text-sm lg:text-base leading-relaxed">
                Kirim pesan untuk memulai obrolan!
              </p>
            </div>

            {/* Info Items */}
            <div className="space-y-6 lg:space-y-8 my-8 relative z-10">
              <a
                href="tel:+10123456789"
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-all duration-200">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm lg:text-base font-medium text-white/90 group-hover:text-white transition-colors">
                  +62 xxx xxxx xxxx
                </span>
              </a>

              <a
                href="mailto:demo@gmail.com"
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-all duration-200">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm lg:text-base font-medium text-white/90 group-hover:text-white transition-colors">
                  info@ciptamaharupa.com
                </span>
              </a>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white/10 rounded-full flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm lg:text-base font-light text-white/90 leading-relaxed">
                  Jakarta, Indonesia

                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-6 relative z-10">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Discord"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 01-1.873-.894.077.077 0 01-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 01.077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 01.078.009c.12.099.246.195.373.289a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100 dark:border-zinc-800 relative z-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-zinc-355 mb-2">
                    Nama Depan
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#8cc55a]/25 focus:border-[#8cc55a] transition-all duration-200 outline-none text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-gray-50/50 dark:bg-zinc-950"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-zinc-355 mb-2">
                    Nama Belakang
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#8cc55a]/25 focus:border-[#8cc55a] transition-all duration-200 outline-none text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-gray-50/50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-zinc-355 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#8cc55a]/25 focus:border-[#8cc55a] transition-all duration-200 outline-none text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-gray-50/50 dark:bg-zinc-950"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-zinc-355 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="+1012 3456 789"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#8cc55a]/25 focus:border-[#8cc55a] transition-all duration-200 outline-none text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-gray-50/50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              {/* Subject Options (Chips) */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-355 mb-3">
                  Pilih Subjek?
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "Tentang Desain Rumah",
                    "Tentang Konstruksi Rumah",
                    "Tentang Masalah Pembayaran",
                    "Tentang Bug Sistem",
                    "Tentang Proyek",
                    "Konsultasi",
                    "Lainnya",
                  ].map((sub) => {
                    const isSelected = formData.subject === sub;
                    return (
                      <label
                        key={sub}
                        className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none flex items-center gap-2 ${isSelected
                          ? "border-[#8cc55a] bg-[#8cc55a]/10 dark:bg-[#8cc55a]/20 text-[#5b8e34] dark:text-[#8cc55a] shadow-sm font-semibold"
                          : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-600 dark:text-zinc-400 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          name="subject"
                          value={sub}
                          checked={isSelected}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span>{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Message Area */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-355 mb-2">
                  Pesan
                </label>
                <textarea
                  name="message"
                  placeholder="Tulis pesan Anda.."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#8cc55a]/25 focus:border-[#8cc55a] transition-all duration-200 outline-none text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-gray-50/50 dark:bg-zinc-950 resize-none min-h-[120px]"
                ></textarea>
              </div>

              {/* reCAPTCHA Container */}
              <div className="pt-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  className="shadow-sm border border-gray-100 rounded-lg overflow-hidden inline-block"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#8cc55a] to-[#7ab349] text-white font-semibold rounded-xl hover:from-[#7ab349] hover:to-[#5b8e34] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Pesan</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
