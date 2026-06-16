"use client";

import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getServiceIcon } from "./helpers";
import { ServiceItem } from "@/lib/schemas/booking.schema";

interface Step1Props {
  services: ServiceItem[];
  isLoading: boolean;
  error: string | null;
  formData: {
    serviceId: string;
    serviceTitle: string;
    servicePrice: string;
    projectDescription: string;
  };
  onServiceSelect: (service: ServiceItem) => void;
  onDescriptionChange: (description: string) => void;
  onNext: () => void;
}

export function Step1Service({ 
  services, 
  isLoading, 
  error, 
  formData, 
  onServiceSelect,
  onDescriptionChange,
  onNext 
}: Step1Props) {
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#8CC540]" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(service => (
            <div 
              key={service._id}
              onClick={() => onServiceSelect(service)}
              className={`
                cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 group
                ${formData.serviceId === service._id 
                  ? 'border-[#8CC540] bg-[#8CC540]/5' 
                  : 'border-slate-100 dark:border-zinc-800 hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-md'
                }
              `}
            >
              <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.serviceId === service._id ? 'bg-[#8CC540] text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 group-hover:bg-[#8CC540]/20'}`}>
                {getServiceIcon(service.category || '')}
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-100">{service.title}</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 mb-3">{service.description}</p>
              <p className="text-xs font-bold text-[#8CC540] uppercase tracking-wide">{service.price}</p>
            </div>
          ))}
        </div>
      )}

      {formData.serviceId && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6 border-t border-slate-100 dark:border-zinc-800"
        >
          <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
            Ceritakan gambaran proyek Anda
          </label>
          <Textarea 
            value={formData.projectDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Contoh: Saya ingin renovasi ruang tamu gaya Japandi dengan budget..."
            className="min-h-[100px] bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-[#8CC540] focus:ring-[#8CC540] text-slate-900 dark:text-zinc-100"
          />
        </motion.div>
      )}

      <Button 
        onClick={onNext} 
        disabled={!formData.serviceId || !formData.projectDescription}
        className="w-full h-14 bg-[#8CC540] hover:bg-[#7AB84A] text-white text-lg font-bold rounded-xl shadow-lg shadow-[#8CC540]/20"
      >
        Lanjut ke Jadwal <ArrowRight className="ml-2"/>
      </Button>
    </div>
  );
}
