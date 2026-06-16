"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  Home,
  Building2,
  Wrench,
  ArrowRight,
  Calculator,
  ClipboardCheck,
  Sparkles,
  DollarSign,
  Check,
  Loader2, // Tambahan icon loading
} from "lucide-react";
import { Slider } from "../../components/ui/slider";
import DesignQuizUser from "@/components/ui/DesignQuizUser";
import { Portfolio } from "@/lib/types";
import { portfolioService } from "@/services/portfolioService";

// --- 1. Interface Data ---
interface CalculatorSettings {
  materials: {
    standard: number;
    premium: number;
    luxury: number;
  };
  roomPrice: number; // Dari backend
}

// Interface gabungan data API + Properti UI (Icon, Warna)
interface ServiceItemUI {
  _id: string; // ID dari MongoDB
  title: string;
  description: string;
  price: string;
  category: string;
  image: string;
  features?: string[];
  icon: React.ElementType; // Properti UI tambahan
  color: string; // Properti UI tambahan
}



interface Stat {
  number: string;
  label: string;
}

export default function HomePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const onNavigate = (page: string) => {
    window.location.href = `/${page}`;
  };

  const getImageUrl = (photoUrl: string) => {
    if (!photoUrl) return "https://placehold.co/600x400?text=No+Image";
    if (photoUrl.startsWith("data:")) return photoUrl;
    if (photoUrl.startsWith("http")) return photoUrl;

    // Logic from Admin: remove '/api' suffix if present to access /uploads correctly
    const baseUrl = API_URL.replace(/\/api$/, "");
    return `${baseUrl}/uploads/${photoUrl}`;
  };

  // --- State Data API ---
  const [services, setServices] = useState<ServiceItemUI[]>([]);
  const [settings, setSettings] = useState<CalculatorSettings | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Calculator State ---
  const [area, setArea] = useState([100]);
  // Simpan ID service yang dipilih agar harga akurat sesuai DB
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [materialType, setMaterialType] = useState<
    "standard" | "premium" | "luxury"
  >("standard");
  const [roomCount, setRoomCount] = useState([3]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const headers: HeadersInit = { "Content-Type": "application/json" };

        const [settingsRes, servicesRes, portfoliosData] = await Promise.all([
          fetch(`${API_URL}/calculator/settings`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/services/shown`, { headers, cache: "no-store" }),
          portfolioService.getAllPortfolios(),
        ]);

        // --- HANDLE PORTFOLIO ---
        setPortfolioItems(portfoliosData.filter((p) => p.isShown));

        // --- 1. HANDLE SETTINGS (KALKULATOR) ---
        if (!settingsRes.ok) {
          console.error("Gagal load settings:", settingsRes.status);
        } else {
          const settingsData = await settingsRes.json();

          // Debugging: Cek di Console Browser (F12) apa isinya
          console.log("Data Settings Mentah:", settingsData);

          // Logika Pintar: Cek apakah data ada di root atau di dalam properti .data
          // Ini mengatasi perbedaan struktur response backend
          const realData = settingsData.data || settingsData;

          if (realData) {
            setSettings({
              // Gunakan ?? agar nilai 0 tidak dianggap false
              materials: realData.materials || {
                standard: 1.0,
                premium: 1.4,
                luxury: 1.8,
              },
              roomPrice: realData.pricePerRoom ?? 0,
            });
          }
        }

        // --- 2. HANDLE SERVICES (LAYANAN) ---
        if (!servicesRes.ok) {
          console.error("Gagal load services:", servicesRes.status);
        } else {
          const servicesData = await servicesRes.json();

          if (
            servicesData.status === "ok" &&
            Array.isArray(servicesData.data)
          ) {
            const mappedServices = servicesData.data.map((s: any) => {
              let style = {
                icon: Home,
                color: "#8CC55A",
                image:
                  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1080",
              };
              const titleLower = s.title.toLowerCase();

              if (titleLower.includes("arsitektur")) {
                style = {
                  icon: Building2,
                  color: "#8CC55A",
                  image:
                    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1080",
                };
              } else if (titleLower.includes("renovasi")) {
                style = {
                  icon: Wrench,
                  color: "#BC5D60",
                  image:
                    "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=1080",
                };
              } else if (titleLower.includes("interior")) {
                style = {
                  icon: Home,
                  color: "#8CC55A",
                  image:
                    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1080",
                };
              } else if (
                titleLower.includes("konstruksi") ||
                titleLower.includes("build")
              ) {
                style = {
                  icon: Building2,
                  color: "#E2B546",
                  image:
                    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1080",
                };
              } else if (
                titleLower.includes("landscape") ||
                titleLower.includes("taman")
              ) {
                style = {
                  icon: Sparkles,
                  color: "#8CC55A",
                  image:
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1080",
                };
              } else if (titleLower.includes("konsultasi")) {
                style = {
                  icon: ClipboardCheck,
                  color: "#8CC55A",
                  image:
                    "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1080",
                };
              }

              return {
                ...s,
                icon: style.icon,
                color: style.color,
                image: s.image || style.image,
              };
            });

            setServices(mappedServices);
            if (mappedServices.length > 0 && !selectedServiceId) {
              setSelectedServiceId(mappedServices[0]._id);
            }
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  // --- 3. Rumus Kalkulasi (Sama persis dengan Admin) ---
  const calculateEstimate = () => {
    if (!settings || !selectedServiceId) return 0;

    // Cari service object berdasarkan ID yang dipilih user
    const selectedService = services.find((s) => s._id === selectedServiceId);
    if (!selectedService) return 0;

    const hargaLayanan = Number(selectedService.price);
    const multiplier = settings.materials[materialType];
    const biayaRuangan = settings.roomPrice * roomCount[0];

    // Rumus: (Luas x Harga x Multiplier) + Biaya Ruangan
    return area[0] * hargaLayanan * multiplier + biayaRuangan;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCalculate = () => {
    setShowResult(true);
  };

  const materialOptions = [
    { value: "standard", label: "Standard" },
    { value: "premium", label: "Premium" },
    { value: "luxury", label: "Luxury" },
  ];

  // Mock Portfolio Items REMOVED - using API data

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#F7F7F7] via-white to-[#F7F7F7] dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="inline-block mb-6 px-6 py-2 bg-[#8CC55A]/10 dark:bg-[#8CC55A]/20 rounded-full text-[#8CC55A] border border-[#8CC55A]/20"
              >
                Arsitektur & Desain Interior Profesional
              </motion.div>
              <h1 className="text-[#333333] dark:text-zinc-100 mb-6 text-4xl lg:text-5xl font-bold leading-tight">
                Wujudkan Hunian Impian Anda Bersama CEMA Design
              </h1>
              <p className="text-[#868686] dark:text-zinc-400 text-lg mb-10 leading-relaxed">
                Layanan lengkap dari konsep hingga realisasi untuk menciptakan
                ruang yang sempurna sesuai visi Anda
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  onClick={() => onNavigate("booking")}
                  className="px-8 py-4 bg-[#8CC55A] text-white rounded-lg hover:bg-[#7AB84A] transition-colors inline-flex items-center gap-2 shadow-lg font-medium cursor-pointer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Konsultasi Gratis <ArrowRight size={20} />
                </motion.button>
                <motion.button
                  onClick={() => {
                    document
                      .getElementById("calculator")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-8 py-4 bg-white dark:bg-zinc-950 text-[#8CC55A] border-2 border-[#8CC55A] rounded-lg hover:bg-[#8CC55A] hover:text-white transition-colors inline-flex items-center gap-2 shadow-lg font-medium cursor-pointer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calculator size={20} /> Hitung Estimasi
                </motion.button>
              </div>
            </motion.div>

            {/* Right - 3D Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block pt-12"
            >
              <div className="relative w-full max-w-2xl mx-auto">
                <img
                  src="/images/3d-model-house.png"
                  alt="3D Interior Design"
                  className="w-full h-auto object-contain"
                  onError={(e) =>
                  (e.currentTarget.src =
                    "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=600")
                  }
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {(
              [
                { number: "500+", label: "Proyek Selesai" },
                { number: "15+", label: "Tahun Pengalaman" },
                { number: "98%", label: "Kepuasan Klien" },
                { number: "50+", label: "Tim Profesional" },
              ] as Stat[]
            ).map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl text-[#8CC55A] font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-[#868686] dark:text-zinc-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section - DATA LIVE DARI API */}
      <section className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-[#333333] dark:text-zinc-100 mb-4 font-bold text-4xl">
              Layanan Terbaik Kami
            </h2>
            <p className="text-[#868686] dark:text-zinc-400 max-w-2xl mx-auto text-lg">
              Solusi lengkap untuk semua kebutuhan arsitektur dan desain
              interior Anda
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#8CC55A]" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service._id} // Gunakan _id dari DB
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -10 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border border-gray-100 dark:border-zinc-800"
                >
                  {/* Image Header */}
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white dark:bg-zinc-800">
                      <service.icon
                        size={24}
                        style={{ color: service.color }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-[#333333] dark:text-zinc-100 mb-2 font-bold text-lg">
                      {service.title}
                    </h3>
                    <p className="text-[#868686] dark:text-zinc-400 mb-4 line-clamp-2 text-sm">
                      {service.description ||
                        "Layanan profesional dengan standar kualitas tinggi."}
                    </p>

                    {/* Price */}
                    <div className="text-[#8CC55A] mb-4 font-semibold">
                      {formatCurrency(Number(service.price))} /m²
                    </div>

                    {/* Features List */}
                    <div className="mb-6 space-y-2 flex-grow">
                      {service.features && service.features.length > 0 ? (
                        service.features
                          .slice(0, 4)
                          .map((feature: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Check
                                className="text-[#8CC55A] flex-shrink-0 mt-0.5"
                                size={16}
                              />
                              <span className="text-[#868686] dark:text-zinc-400">{feature}</span>
                            </div>
                          ))
                      ) : (
                        <div className="text-sm text-gray-400 dark:text-zinc-500">
                          Fitur layanan lengkap tersedia.
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => onNavigate("booking")}
                      className="w-full py-3 rounded-lg text-white transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                      style={{ backgroundColor: service.color }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Konsultasi Gratis <ArrowRight size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <motion.button
              onClick={() => onNavigate("services")}
              className="px-8 py-4 border-2 border-[#8CC55A] text-[#8CC55A] rounded-lg hover:bg-[#8CC55A] hover:text-white transition-colors inline-flex items-center gap-2 shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Semua Layanan <ArrowRight size={20} />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Portfolio Highlights */}
      <section className="py-20 bg-[#F7F7F7] dark:bg-zinc-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-[#333333] dark:text-zinc-100 mb-4 font-bold text-4xl">
              Portfolio Kami
            </h2>
            <p className="text-[#868686] dark:text-zinc-400">
              Lihat beberapa proyek terbaik yang telah kami kerjakan
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#8CC55A]" size={40} />
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory">
              {portfolioItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 w-80 snap-center cursor-pointer"
                >
                  <div className="relative h-96 rounded-lg overflow-hidden group">
                    <ImageWithFallback
                      src={getImageUrl(item.photoUrl)}
                      alt={item.displayName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                      <div>
                        <div className="text-[#8CC55A] mb-2">{item.category}</div>
                        <h3 className="text-white">{item.displayName}</h3>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <motion.button
              onClick={() => onNavigate("portfolio")}
              className="px-6 py-3 border-2 border-[#8CC55A] text-[#8CC55A] rounded-lg hover:bg-[#8CC55A] hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Semua Portfolio <ArrowRight size={20} />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Calculator Section - UPDATED LOGIC */}
      <section className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300" id="calculator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Calculator size={64} className="mx-auto mb-4 text-[#8CC55A]" />
            <h2 className="text-[#333333] dark:text-zinc-100 mb-4">Kalkulator Estimasi Biaya</h2>
            <p className="text-[#868686] dark:text-zinc-400 max-w-2xl mx-auto">
              Hitung perkiraan biaya proyek desain Anda dengan mudah
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-[#F7F7F7] dark:bg-zinc-900 rounded-lg shadow-lg p-8 border dark:border-zinc-800"
            >
              <h3 className="text-[#333333] dark:text-zinc-100 mb-6">Input Detail Proyek</h3>

              <div className="space-y-8">
                {/* Building Area */}
                <div>
                  <label className="block text-[#333333] dark:text-zinc-200 mb-2">
                    <Home className="inline mr-2" size={18} />
                    Luas Bangunan
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={area}
                        onValueChange={setArea}
                        min={20}
                        max={500}
                        step={10}
                      />
                    </div>
                    <div className="w-24 text-center">
                      <span className="text-[#333333] dark:text-zinc-250 font-bold">{area[0]} m²</span>
                    </div>
                  </div>
                </div>

                {/* Service Type - DYNAMIC FROM API */}
                <div>
                  <label className="block text-[#333333] dark:text-zinc-200 mb-2">
                    <Sparkles className="inline mr-2" size={18} />
                    Jenis Layanan
                  </label>
                  {isLoading ? (
                    <div className="text-gray-400 dark:text-zinc-500 text-sm">
                      Memuat layanan...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {services.map((service) => (
                        <motion.button
                          key={service._id}
                          onClick={() => setSelectedServiceId(service._id)}
                          className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center text-center h-full cursor-pointer ${selectedServiceId === service._id
                            ? "border-[#8CC55A] bg-[#8CC55A]/10 dark:bg-[#8CC55A]/20"
                            : "border-gray-200 dark:border-zinc-800 hover:border-[#8CC55A]"
                            }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-[#333333] dark:text-zinc-200 font-medium text-sm">
                            {service.title}
                          </div>
                          <div className="text-[#8CC55A] text-xs mt-1">
                            {formatCurrency(Number(service.price))}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Material Type */}
                <div>
                  <label className="block text-[#333333] dark:text-zinc-200 mb-2">
                    <Sparkles className="inline mr-2" size={18} />
                    Kualitas Material
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {materialOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => setMaterialType(option.value as any)}
                        className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${materialType === option.value
                          ? "border-[#8CC55A] bg-[#8CC55A]/10 dark:bg-[#8CC55A]/20"
                          : "border-gray-200 dark:border-zinc-800 hover:border-[#8CC55A]"
                          }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-[#333333] dark:text-zinc-200">{option.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Room Count */}
                <div>
                  <label className="block text-[#333333] dark:text-zinc-200 mb-2">
                    Jumlah Ruangan
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={roomCount}
                        onValueChange={setRoomCount}
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>
                    <div className="w-24 text-center">
                      <span className="text-[#333333] dark:text-zinc-250 font-bold">
                        {roomCount[0]} ruangan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calculate Button */}
                <motion.button
                  onClick={handleCalculate}
                  className="w-full bg-[#8CC55A] text-white py-3 rounded-lg hover:bg-[#7AB84A] transition-colors flex items-center justify-center gap-2 cursor-pointer font-bold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Calculator size={20} />
                  Hitung Estimasi
                </motion.button>
              </div>
            </motion.div>

            {/* Result Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Estimate Result */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 border dark:border-zinc-800">
                <h4 className="text-[#333333] dark:text-zinc-100 mb-4">
                  <DollarSign className="inline mr-2" size={20} />
                  Estimasi Biaya
                </h4>
                {showResult ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="p-6 bg-[#8CC55A] rounded-lg text-white text-center">
                      <div className="mb-2">Total Estimasi</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(calculateEstimate())}
                      </div>
                    </div>
                    <div className="text-[#868686] dark:text-zinc-400">
                      <p className="mb-2">Rincian:</p>
                      <ul className="space-y-1 text-sm">
                        <li>• Luas: {area[0]} m²</li>
                        <li>
                          • Layanan:{" "}
                          {services.find((s) => s._id === selectedServiceId)
                            ?.title || "-"}
                        </li>
                        <li>
                          • Material:{" "}
                          {
                            materialOptions.find(
                              (m) => m.value === materialType
                            )?.label
                          }
                        </li>
                        <li>• Ruangan: {roomCount[0]} ruangan</li>
                      </ul>
                    </div>
                    <motion.button
                      onClick={() => onNavigate("booking")}
                      className="w-full bg-[#E2B546] text-white py-2 rounded-lg hover:bg-[#D1A435] transition-colors font-medium cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Booking Konsultasi
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="text-center text-[#868686] dark:text-zinc-400 py-8">
                    <Calculator size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Isi form dan klik "Hitung Estimasi"</p>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-[#E2B546]/10 dark:bg-[#E2B546]/5 border border-[#E2B546] rounded-lg p-6">
                <div className="text-[#E2B546] mb-3 font-medium">
                  💡 Catatan
                </div>
                <ul className="space-y-2 text-[#868686] dark:text-zinc-400 text-sm">
                  <li>• Estimasi ini adalah perkiraan kasar</li>
                  <li>• Harga final dapat berbeda</li>
                  <li>• Konsultasi gratis untuk detail lebih lanjut</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#F7F7F7] dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <DesignQuizUser />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#F7F7F7] dark:bg-zinc-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-[#333333] dark:text-zinc-100 mb-4 font-bold text-4xl">
              Apa Kata Klien Kami
            </h2>
            <p className="text-[#868686] dark:text-zinc-400">
              Kepuasan klien adalah prioritas utama kami
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-zinc-950 p-6 rounded-lg shadow-md border dark:border-zinc-800"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#E2B546]">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-[#868686] dark:text-zinc-400 mb-4">
                  "Sangat puas dengan hasil desain dari Company X. Tim sangat
                  profesional dan memahami kebutuhan kami."
                </p>
                <div>
                  <div className="text-[#333333] dark:text-zinc-200">Budi Santoso</div>
                  <div className="text-[#868686] dark:text-zinc-500 text-sm">Jakarta</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
