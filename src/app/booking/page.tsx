"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Info, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/hooks/useBooking";
import { ServiceItem } from "@/lib/schemas/booking.schema";

// Booking Components
import {
  ExitDialog,
  BookingSummary,
  Step1Service,
  Step2Schedule,
  Step3Contact,
  Step4Confirmation,
  formatDate,
} from "@/components/booking";

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function BookingPage() {
  const { data: session, status } = useSession();
  const {
    services,
    isLoadingServices,
    isSubmitting,
    isAuthenticating,
    servicesError,
    submitError,
    authError,
    bookingSuccess,
    handleLogin,
    handleRegister,
    submitBooking,
  } = useBooking();

  // UI State
  const [step, setStep] = useState(1);
  const [showLogin, setShowLogin] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    serviceId: "",
    serviceTitle: "",
    servicePrice: "",
    projectDescription: "",
    date: "",
    time: "",
    method: "" as "online" | "offline" | "",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    guestPassword: "",
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Derived states
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const userData = session?.user;
  const displayName = isLoggedIn ? (userData?.name || "") : formData.guestName;
  const displayPhone = formData.guestPhone;

  // Auto-scroll to top on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // =============================================================================
  // HANDLERS
  // =============================================================================
  const handleExit = () => {
    const hasData = formData.serviceId || formData.date || formData.guestName;
    hasData ? setShowExitDialog(true) : (window.location.href = "/");
  };

  const handleServiceSelect = (service: ServiceItem) => {
    setFormData({ 
      ...formData, 
      serviceId: service._id, 
      serviceTitle: service.title, 
      servicePrice: service.price 
    });
  };

  const handleAuth = async () => {
    let success = false;
    if (showLogin) {
      success = await handleLogin({
        email: formData.guestEmail,
        password: formData.guestPassword,
      });
    } else {
      success = await handleRegister({
        name: formData.guestName,
        email: formData.guestEmail,
        password: formData.guestPassword,
        phoneNumber: formData.guestPhone,
      });
    }

    if (success) {
      const bookingSuccess = await submitBooking({
        serviceId: formData.serviceId,
        serviceTitle: formData.serviceTitle,
        servicePrice: formData.servicePrice,
        projectDescription: formData.projectDescription,
        date: formData.date,
        time: formData.time,
        method: formData.method as "online" | "offline",
        clientName: formData.guestName || "Client",
        clientPhone: formData.guestPhone,
      });

      if (bookingSuccess) {
        window.location.href = "/dashboard/client/my-project";
      }
    }
    return success;
  };

  const handleFinalSubmit = async () => {
    if (!formData.method) return;
    
    await submitBooking({
      serviceId: formData.serviceId,
      serviceTitle: formData.serviceTitle,
      servicePrice: formData.servicePrice,
      projectDescription: formData.projectDescription,
      date: formData.date,
      time: formData.time,
      method: formData.method as "online" | "offline",
      clientName: isLoggedIn ? (userData?.name || "") : formData.guestName,
      clientPhone: formData.guestPhone,
    });
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <>
      <ExitDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={() => (window.location.href = "/")}
      />

      <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-zinc-950">
        
        {/* --- LEFT PANEL --- */}
        <div className="lg:w-[40%] bg-slate-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden lg:h-screen order-1 lg:order-none">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Info size={200} />
          </div>

          <BookingSummary
            step={step}
            serviceTitle={formData.serviceTitle}
            servicePrice={formData.servicePrice}
            date={formData.date}
            time={formData.time}
            displayName={displayName}
            method={formData.method}
            formatDate={formatDate}
            onExit={handleExit}
          />
        </div>

        {/* --- RIGHT PANEL --- */}
        <div ref={scrollRef} className="lg:w-[60%] h-auto lg:h-screen overflow-y-auto bg-white dark:bg-zinc-950 order-2 lg:order-none relative">
          
          {/* Top Navigation */}
          <div className="absolute top-8 right-8 flex items-center gap-4 z-40">
            {isLoggedIn && (
              <a 
                href="/dashboard/client/my-project"
                className="flex items-center gap-2 text-sm text-[#8CC540] hover:text-[#7AB84A] border border-[#8CC540]/30 hover:border-[#8CC540] px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all font-bold"
              >
                My Projects
              </a>
            )}
            <a 
              href="https://wa.me/62123456789" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400 hover:text-[#8CC540] transition-colors"
            >
              <MessageCircle size={18} />
              <span className="hidden sm:inline font-medium">Need Help?</span>
            </a>
            <button
              onClick={handleExit}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-655 dark:hover:text-zinc-200 transition-all cursor-pointer"
              title="Batal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto p-6 lg:p-12 min-h-full flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {bookingSuccess ? (
                <SuccessState displayName={displayName} isLoggedIn={isLoggedIn} />
              ) : (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >   
                  <StepHeader step={step} />

                  {step === 1 && (
                    <Step1Service
                      services={services}
                      isLoading={isLoadingServices}
                      error={servicesError}
                      formData={formData}
                      onServiceSelect={handleServiceSelect}
                      onDescriptionChange={(desc) => setFormData({...formData, projectDescription: desc})}
                      onNext={() => setStep(2)}
                    />
                  )}

                  {step === 2 && (
                    <Step2Schedule
                      formData={formData}
                      onDateSelect={(date) => setFormData({...formData, date})}
                      onTimeSelect={(time) => setFormData({...formData, time})}
                      onNext={() => setStep(3)}
                      onBack={() => setStep(1)}
                    />
                  )}

                  {step === 3 && (
                    <Step3Contact
                      isLoggedIn={isLoggedIn}
                      userData={userData}
                      formData={formData}
                      onMethodSelect={(method) => setFormData({...formData, method})}
                      onNameChange={(name) => setFormData({...formData, guestName: name})}
                      onPhoneChange={(phone) => setFormData({...formData, guestPhone: phone})}
                      onNext={() => setStep(4)}
                      onBack={() => setStep(2)}
                    />
                  )}

                  {step === 4 && (
                    <Step4Confirmation
                      isLoggedIn={isLoggedIn}
                      userData={userData}
                      formData={formData}
                      showLogin={showLogin}
                      displayName={displayName}
                      displayPhone={displayPhone}
                      isSubmitting={isSubmitting}
                      isAuthenticating={isAuthenticating}
                      submitError={submitError}
                      authError={authError}
                      onEmailChange={(email) => setFormData({...formData, guestEmail: email})}
                      onPasswordChange={(pw) => setFormData({...formData, guestPassword: pw})}
                      onToggleLogin={() => setShowLogin(!showLogin)}
                      onEditStep={setStep}
                      onAuth={handleAuth}
                      onSubmit={handleFinalSubmit}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// LOCAL SUB-COMPONENTS
// =============================================================================
function StepHeader({ step }: { step: number }) {
  const titles: Record<number, string> = {
    1: "Pilih Layanan",
    2: "Tentukan Jadwal",
    3: "Detail Kontak",
    4: "Konfirmasi Booking",
  };

  return (
    <div className="mb-8">
      <p className="text-[#8CC540] font-bold text-xs uppercase mb-1">Step {step} of 4</p>
      <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-zinc-100">{titles[step]}</h2>
    </div>
  );
}

function SuccessState({ displayName, isLoggedIn }: { displayName: string; isLoggedIn: boolean }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-24 h-24 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#8CC540]">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-2">Booking Berhasil!</h2>
      <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
        Terima kasih <strong>{displayName}</strong>. Kami telah menerima jadwal Anda. 
        Tim kami akan segera menghubungi via WhatsApp untuk konfirmasi lebih lanjut.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={() => (window.location.href = "/")} 
          className="bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 px-8 py-6 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer"
        >
          Kembali ke Beranda
        </Button>
        {isLoggedIn && (
          <Button 
            onClick={() => (window.location.href = "/dashboard/client/my-project")} 
            className="bg-[#8CC540] text-white hover:bg-[#7AB84A] px-8 py-6 rounded-xl shadow-lg shadow-[#8CC540]/20 font-bold"
          >
            Ke My Projects
          </Button>
        )}
      </div>
    </motion.div>
  );
}
