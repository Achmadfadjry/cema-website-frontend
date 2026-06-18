"use client";

import { motion } from "motion/react";
import { CheckCircle2, Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "./helpers";

interface Step4Props {
  isLoggedIn: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any;
  formData: {
    serviceTitle: string;
    date: string;
    time: string;
    method: string;
    guestEmail: string;
    guestPassword: string;
  };
  showLogin: boolean;
  displayName: string;
  displayPhone: string;
  isSubmitting: boolean;
  isAuthenticating: boolean;
  submitError: string | null;
  authError: string | null;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onToggleLogin: () => void;
  onEditStep: (step: number) => void;
  onAuth: () => Promise<boolean>;
  onSubmit: () => Promise<void>;
}

export function Step4Confirmation({
  isLoggedIn,
  userData,
  formData,
  showLogin,
  displayName,
  displayPhone,
  isSubmitting,
  isAuthenticating,
  submitError,
  authError,
  onEmailChange,
  onPasswordChange,
  onToggleLogin,
  onEditStep,
  onAuth,
  onSubmit,
}: Step4Props) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase text-slate-500 dark:text-zinc-400 font-bold mb-1">Service</p>
            <p className="font-bold text-slate-900 dark:text-zinc-100">{formData.serviceTitle}</p>
          </div>
          <button onClick={() => onEditStep(1)} className="text-xs text-[#8CC540] font-bold hover:underline">Edit</button>
        </div>
        <div className="h-px bg-slate-200 dark:bg-zinc-800"></div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase text-slate-500 dark:text-zinc-400 font-bold mb-1">Jadwal</p>
            <p className="font-bold text-slate-900 dark:text-zinc-100">{formatDate(formData.date)}, {formData.time}</p>
          </div>
          <button onClick={() => onEditStep(2)} className="text-xs text-[#8CC540] font-bold hover:underline">Edit</button>
        </div>
        <div className="h-px bg-slate-200 dark:bg-zinc-800"></div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase text-slate-500 dark:text-zinc-400 font-bold mb-1">Kontak</p>
            <p className="font-bold text-slate-900 dark:text-zinc-100">{displayName} ({displayPhone})</p>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{formData.method === 'online' ? 'Online Meeting' : 'Offline Visit'}</p>
          </div>
          <button onClick={() => onEditStep(3)} className="text-xs text-[#8CC540] font-bold hover:underline">Edit</button>
        </div>
      </div>

      {/* AUTH GATE */}
      <div className="pt-4">
        {isLoggedIn ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-200 dark:border-green-900 text-green-800 dark:text-green-400">
              <CheckCircle2 size={20} />
              <span className="text-sm font-medium">Anda sudah login sebagai <strong>{userData?.name}</strong></span>
            </div>
            {submitError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {submitError}
              </div>
            )}
            <Button 
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full h-14 bg-[#8CC540] hover:bg-[#7AB84A] text-white text-lg font-bold rounded-xl shadow-lg shadow-[#8CC540]/20"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Memproses...</>
              ) : (
                "Konfirmasi Booking"
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-zinc-900/30 border-2 border-slate-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Lock size={18} className="text-[#8CC540]"/>
                {showLogin ? "Login untuk Melanjutkan" : "Buat Akun untuk Memantau Proyek"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                {showLogin ? "Masuk dengan akun yang sudah ada." : "Daftar agar Anda dapat melacak progress proyek Anda."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3.5 text-slate-400 dark:text-zinc-500" />
                  <Input 
                    value={formData.guestEmail}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="email@example.com" 
                    className="pl-10 h-11 border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-[#8CC540]" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-slate-400 dark:text-zinc-500" />
                  <Input 
                    type="password" 
                    value={formData.guestPassword}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    placeholder="••••••••" 
                    className="pl-10 h-11 border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-[#8CC540]" 
                  />
                </div>
              </div>
              {authError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {authError}
                </div>
              )}
              <div className="pt-2">
                <Button 
                  onClick={onAuth}
                  disabled={!formData.guestEmail || !formData.guestPassword || isAuthenticating}
                  className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-bold"
                >
                  {isAuthenticating ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Memproses...</>
                  ) : (
                    showLogin ? "Login & Konfirmasi" : "Daftar & Konfirmasi Booking"
                  )}
                </Button>
              </div>
              <p className="text-xs text-center text-slate-500 dark:text-zinc-400 mt-4">
                {showLogin ? "Belum punya akun? " : "Sudah punya akun? "}
                <button 
                  onClick={onToggleLogin}
                  className="text-[#8CC540] font-bold hover:underline"
                >
                  {showLogin ? "Daftar disini" : "Login"}
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
