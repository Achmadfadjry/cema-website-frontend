"use client";

import { CheckCircle2, Clock, User, Lock } from "lucide-react";
import { ImageWithFallback } from "@/components/ui";

interface BookingSummaryProps {
  step: number;
  serviceTitle: string;
  servicePrice: string;
  date: string;
  time: string;
  displayName: string;
  method: string;
  formatDate: (dateStr: string) => string;
  onExit: () => void;
}

export function BookingSummary({
  step,
  serviceTitle,
  servicePrice,
  date,
  time,
  displayName,
  method,
  formatDate,
  onExit,
}: BookingSummaryProps) {
  return (
    <div className="flex-1 flex flex-col justify-center z-10">
      {/* Brand Logo */}
      <button 
        onClick={onExit}
        className="hover:opacity-80 transition-opacity z-20  w-24 h-24 group mb-16"
        title="Kembali ke Beranda"
      >
        <ImageWithFallback
          src="/images/Cema_Logo.png"
          alt="Cema Logo"
          className="w-full h-full object-contain"
        />
      </button>

      {/* Header */}
      <div className="mb-8">
        <span className="text-[#8CC540] font-bold tracking-widest text-xs uppercase mb-2 block">
          Booking Consultation
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
          Wujudkan Proyek <br/>
          <span className="text-[#8CC540]">Impian Anda.</span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
          Konsultasikan kebutuhan hunian atau bangunan Anda bersama tim ahli kami. 
          Proses mudah, transparan, dan profesional.
        </p>
      </div>

      {/* LIVE SUMMARY CARD */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 space-y-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700 pb-3">
          Booking Summary
        </h3>
        
        <div className="space-y-4">
          {/* Service */}
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1.5 rounded-full ${serviceTitle ? 'bg-[#8CC540] text-slate-900' : 'bg-slate-700 text-slate-500'}`}>
              <CheckCircle2 size={14} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Layanan</p>
              <p className="text-lg font-medium text-white">{serviceTitle || "Belum dipilih"}</p>
              {servicePrice && <p className="text-xs text-[#8CC540]">{servicePrice}</p>}
            </div>
          </div>

          {/* Schedule */}
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1.5 rounded-full ${date && time ? 'bg-[#8CC540] text-slate-900' : 'bg-slate-700 text-slate-500'}`}>
              <Clock size={14} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Waktu</p>
              <p className="text-sm font-medium text-white">
                {date ? formatDate(date) : "Belum dipilih"}
              </p>
              <p className="text-sm text-slate-300">
                {time ? `Jam ${time}` : ""}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1.5 rounded-full ${displayName ? 'bg-[#8CC540] text-slate-900' : 'bg-slate-700 text-slate-500'}`}>
              <User size={14} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Klien</p>
              <p className="text-sm font-medium text-white">{displayName || "-"}</p>
              <p className="text-xs text-slate-400">
                {method ? (method === 'online' ? 'Via Google Meet' : 'Pertemuan Tatap Muka') : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 pt-4">
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-[#8CC540]' : 'bg-slate-700'}`} 
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 space-y-3">
        <p className="text-slate-400 text-sm italic">"Percayakan proyek Anda pada ahlinya."</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>© 2024 Cema Design</span>
          <span className="flex items-center gap-1">
            <Lock size={12} />
            Secure SSL
          </span>
        </div>
      </div>
    </div>
  );
}
