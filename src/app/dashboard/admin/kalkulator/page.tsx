"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Save,
  Calculator,
  RefreshCw,
  LayoutGrid,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import {
  fetchCalculatorDataAction,
  saveCalculatorSettingsAction,
} from "@/app/actions/calculator-actions";

interface CalculatorSettings {
  materials: {
    standard: number;
    premium: number;
    luxury: number;
  };
  roomPrice: number;
}

interface ServiceItem {
  _id: string;
  title: string;
  price: string;
  category: string;
}

interface SimulationState {
  area: number;
  serviceId: string;
  material: "standard" | "premium" | "luxury";
  rooms: number;
}

export default function CalculatorPage() {
  const { data: session, status } = useSession();

  const [settings, setSettings] = useState<CalculatorSettings>({
    materials: { standard: 1.0, premium: 1.4, luxury: 1.8 },
    roomPrice: 0,
  });

  const [services, setServices] = useState<ServiceItem[]>([]);

  const [sim, setSim] = useState<SimulationState>({
    area: 100,
    serviceId: "",
    material: "standard",
    rooms: 3,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // === 1. LOAD DATA DARI API ===
  useEffect(() => {
    if (status === "loading") return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchCalculatorDataAction();

        if (result.success && result.data) {
          const { settings, services } = result.data;
          setSettings(settings);
          setServices(services);

          if (services.length > 0) {
            setSim((prev) => ({
              ...prev,
              serviceId: services[0]._id,
            }));
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status]);

  // === 2. SIMPAN KE API (PUT) ===
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveCalculatorSettingsAction(settings);

      if (result.success) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(`Gagal menyimpan: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getSelectedServicePrice = () => {
    const selected = services.find((s) => s._id === sim.serviceId);
    return selected ? Number(selected.price) : 0;
  };

  const calculateSimulation = () => {
    const servicePrice = getSelectedServicePrice();
    const basePrice =
      sim.area * servicePrice * settings.materials[sim.material];
    const roomCost = sim.rooms * settings.roomPrice;
    return basePrice + roomCost;
  };

  if (status === "loading" || isLoading) {
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
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-350">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold transition-all bg-white dark:bg-zinc-900 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-400">
            <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
            <div>
              <p className="leading-tight">Berhasil Disimpan!</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">Database telah diperbarui.</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm gap-4 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
            <Calculator size={22} />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800 dark:text-zinc-100 tracking-tight">
              Pengaturan Kalkulator Harga
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              Sesuaikan logika perhitungan & multiplier simulasi biaya
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel: Settings */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6 transition-colors duration-300">
          
          {/* Service Price list */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-4 pb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black">
                1
              </span>
              Harga Dasar Jasa (Live database)
            </h4>
            
            <div className="space-y-3">
              {services.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Belum ada data layanan dasar.</p>
              ) : (
                services.map((srv) => (
                  <div key={srv._id} className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      {srv.title} <span className="text-[9px] text-slate-400 dark:text-zinc-500">({srv.category})</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-500 dark:text-zinc-400 text-xs font-semibold cursor-not-allowed"
                      value={`${formatRupiah(Number(srv.price))}/m²`}
                    />
                  </div>
                ))
              )}
              <p className="text-[10px] text-primary font-bold italic mt-2">
                * Harga dasar di atas sinkron dari menu Kelola Layanan.
              </p>
            </div>
          </div>

          {/* Room Price */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-4 pb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black">
                2
              </span>
              Biaya Tambahan Per Sekat/Ruangan
            </h4>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Harga Per Ruangan
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-zinc-500">
                  Rp
                </span>
                <input
                  type="number"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 transition-all text-xs font-bold"
                  value={settings.roomPrice}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      roomPrice: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Material Multiplier */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-4 pb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black">
                3
              </span>
              Faktor Multiplier Material
            </h4>
            
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(settings.materials).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 block text-center uppercase tracking-wider capitalize">
                    {key}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 text-center text-xs font-black"
                    value={value}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        materials: {
                          ...settings.materials,
                          [key]: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold block text-center uppercase">
                    kali (x)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white py-3 px-4 rounded-xl transition-all font-bold text-xs shadow-md shadow-primary/20 hover:shadow-lg disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? "Menyimpan..." : "Simpan Pengaturan Kalkulator"}
            </button>
          </div>
        </div>

        {/* Right Panel: Live User Simulation Preview */}
        <div className="bg-slate-50 dark:bg-zinc-950 p-6 rounded-2xl border border-dashed border-slate-350 dark:border-zinc-800 flex flex-col transition-colors duration-300">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex-1 flex flex-col transition-colors duration-300">
            
            <div className="flex items-center gap-2 mb-6 text-slate-400 dark:text-zinc-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-50 dark:border-zinc-800 pb-3">
              <RefreshCw size={12} className="animate-spin-slow" />
              Live Preview (Tampilan Klien)
            </div>

            <div className="space-y-6 flex-1 text-xs font-bold">
              {/* Luas Bangunan */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <LayoutGrid size={12} /> Luas Bangunan
                  </label>
                  <span className="font-black text-slate-800 dark:text-zinc-200 text-sm">
                    {sim.area} m²
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={sim.area}
                  onChange={(e) =>
                    setSim({ ...sim, area: Number(e.target.value) })
                  }
                  className="w-full accent-primary h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Jenis Layanan
                </label>
                <select
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-slate-800 dark:text-zinc-200 text-xs font-medium cursor-pointer transition-all"
                  value={sim.serviceId}
                  onChange={(e) =>
                    setSim({ ...sim, serviceId: e.target.value })
                  }
                >
                  {services.map((srv) => (
                    <option key={srv._id} value={srv._id}>
                      {srv.title} ({formatRupiah(Number(srv.price))}/m²)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quality Selection */}
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Kualitas Material
                </label>
                <div className="flex gap-2">
                  {(["standard", "premium", "luxury"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSim({ ...sim, material: m })}
                      className={`flex-1 py-2 rounded-xl border capitalize transition-all cursor-pointer text-center ${
                        sim.material === m
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/10 font-bold"
                          : "bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 font-medium"
                      }`}
                    >
                      <span className="text-xs">{m}</span>
                      <span className="block text-[9px] opacity-75 font-bold mt-0.5">
                        x{settings.materials[m]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rooms Selection */}
              <div className="pt-4 border-t border-dashed border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Jumlah Ruangan
                  </label>
                  <span className="font-black text-slate-800 dark:text-zinc-200 text-sm">
                    {sim.rooms} Ruangan
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={sim.rooms}
                  onChange={(e) =>
                    setSim({ ...sim, rooms: Number(e.target.value) })
                  }
                  className="w-full accent-primary h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[9px] text-slate-400 dark:text-zinc-500 mt-1 text-right font-black uppercase">
                  + {formatRupiah(settings.roomPrice)} / ruangan
                </p>
              </div>
            </div>

            {/* Calculations total */}
            <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-zinc-800">
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mb-1">Estimasi Total Biaya</p>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-primary">
                  {formatRupiah(calculateSimulation())}
                </h2>
              </div>
              
              <div className="mt-4 text-[10px] text-slate-500 dark:text-zinc-450 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Biaya Konstruksi:</span>
                  <span className="font-black text-slate-800 dark:text-zinc-300">
                    {formatRupiah(
                      sim.area *
                      getSelectedServicePrice() *
                      settings.materials[sim.material]
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-primary">
                  <span>Biaya Ruangan ({sim.rooms}x):</span>
                  <span className="font-black">
                    + {formatRupiah(sim.rooms * settings.roomPrice)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
