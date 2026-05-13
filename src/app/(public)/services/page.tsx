"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  Check,
  Search,
  ArrowRight,
  Package,
  Star,
  Building2,
  Home,
  Wrench,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  imageUrl: string;
  category: string;
  popular: boolean;
}

export default function ServicesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchServices = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (!API_URL) return;

        const res = await fetch(`${API_URL}/services/shown`, { cache: "no-store" });
        const response = await res.json();

        if (res.ok && response.status === "ok" && Array.isArray(response.data)) {
          const mappedServices: Service[] = response.data.map((item: any) => ({
            id: item.id || item._id,
            name: item.title,
            description: item.description,
            price: isNaN(Number(item.price)) ? item.price : Number(item.price).toLocaleString("id-ID"),
            features: item.features || [],
            imageUrl: item.image || "",
            category: item.category,
            popular: item.isPopular || false,
          }));
          setServices(mappedServices);
        }
      } catch (error) {
        console.error("Gagal mengambil data services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = ["All", ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
    const search = searchTerm.toLowerCase();
    return matchesCategory && (service.name.toLowerCase().includes(search) || service.description.toLowerCase().includes(search));
  });

  const getServiceIcon = (name: string) => {
    const iconMap: Record<string, any> = {
      "Desain Arsitektur": Building2,
      "Desain Interior": Home,
      "Build & Construction": Building2,
    };
    return iconMap[name] || Package;
  };

  const getServiceColor = (name: string) => {
    const colorMap: Record<string, string> = {
      "Renovasi & Remodeling": "#BC5D60",
      "Build & Construction": "#E2B546",
    };
    return colorMap[name] || "#8CC55A";
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <section className="relative pt-48 pb-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-[#8CC55A]/10 rounded-full text-[#8CC55A] text-sm font-medium">
            Layanan Kami
          </div>
          <h1 className="text-[#333333] mb-4 font-bold text-4xl">
            Solusi Lengkap untuk Kebutuhan Desain & Konstruksi
          </h1>
          <p className="text-[#868686] text-lg max-w-2xl mx-auto mb-10">
            Dari konsep hingga realisasi, kami menyediakan layanan profesional untuk mewujudkan ruang impian Anda
          </p>

          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#868686]" size={20} />
              <Input
                placeholder="Cari layanan yang Anda butuhkan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-gray-200 focus:ring-[#8CC55A] rounded-lg"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[#868686] flex items-center gap-2">
                <Package size={16} /> Kategori:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-1.5 rounded-lg text-sm transition-all ${
                    selectedCategory === cat ? "bg-[#8CC55A] text-white" : "bg-gray-100 text-[#868686] hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Service Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-20 text-[#868686]">Memuat layanan...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  icon={getServiceIcon(service.name)}
                  color={getServiceColor(service.name)}
                  onNavigate={(name: string) => router.push(`/booking?service=${encodeURIComponent(name)}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-[#333333] text-3xl font-bold mb-4">Mengapa Memilih Cema Design</h2>
          <p className="text-[#868686] mb-12">Kami berkomitmen memberikan layanan terbaik dengan standar profesional tinggi</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-[#8CC55A] rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Mulai Konsultasi Gratis Sekarang</h2>
          <p className="mb-8 opacity-90">Dapatkan estimasi biaya dan timeline proyek Anda dalam 24 jam</p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-[#8CC55A] px-8 py-3 rounded-lg font-medium">Booking Sekarang →</button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-medium">Coba Kalkulator Estimasi</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service, index, icon: Icon, color, onNavigate }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col"
    >
      <div className="relative h-60">
        <ImageWithFallback src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-bold text-[#8CC55A] uppercase tracking-wider">
          {service.category}
        </div>
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-[#333333] mb-2">{service.name}</h3>
        <p className="text-[#868686] text-sm line-clamp-2 mb-4 flex-grow">{service.description}</p>
        <div className="text-[#8CC55A] font-bold text-lg mb-6">Rp {service.price}</div>
        <button
          onClick={() => onNavigate(service.name)}
          className="w-full py-3 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: color }}
        >
          Konsultasi Gratis <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}