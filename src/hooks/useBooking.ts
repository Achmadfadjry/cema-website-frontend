"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { ServiceItem, BookingFormData, LoginPayload, RegisterPayload } from "@/lib/schemas/booking.schema";
import { getServices } from "@/lib/services/master.service";
import { login, register } from "@/lib/services/auth.service";
import { createBookingFromForm } from "@/lib/services/booking.service";

interface UseBookingState {
  // Data
  services: ServiceItem[];
  
  // Loading states
  isLoadingServices: boolean;
  isSubmitting: boolean;
  isAuthenticating: boolean;
  
  // Error states
  servicesError: string | null;
  submitError: string | null;
  authError: string | null;
  
  // Success states
  bookingSuccess: boolean;
  bookingResult: any | null;
}

interface UseBookingActions {
  fetchServices: () => Promise<void>;
  handleLogin: (credentials: LoginPayload) => Promise<boolean>;
  handleRegister: (userData: Omit<RegisterPayload, "role">) => Promise<boolean>;
  submitBooking: (formData: BookingFormData) => Promise<boolean>;
  resetErrors: () => void;
  resetBookingState: () => void;
}

export function useBooking(): UseBookingState & UseBookingActions {
  const { data: session, status } = useSession();
  
  // State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<any | null>(null);

  // Derived state
  const isAuthenticated = status === "authenticated" && !!session?.user;

  /**
   * Fetch available services on mount
   */
  const fetchServices = useCallback(async () => {
    setIsLoadingServices(true);
    setServicesError(null);
    
    try {
      const data = await getServices();
      console.log("✅ [useBooking] fetchServices Response:", data);
      setServices(data);
    } catch (error: any) {
      console.error("❌ [useBooking] fetchServices Error:", error);
      setServicesError(error.message || "Gagal memuat layanan");
    } finally {
      setIsLoadingServices(false);
    }
  }, []);

  /**
   * Handle user login
   */
  const handleLogin = useCallback(async (credentials: LoginPayload): Promise<boolean> => {
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      // Use NextAuth signIn for session management
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError(result.error);
        return false;
      }

      return true;
    } catch (error: any) {
      console.error("❌ [useBooking] handleLogin Error:", error);
      setAuthError(error.message || "Login gagal");
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  /**
   * Handle user registration
   */
  const handleRegister = useCallback(async (userData: Omit<RegisterPayload, "role">): Promise<boolean> => {
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      // Register user
      await register({ ...userData, role: "client" });
      
      // Auto-login after registration
      const loginResult = await signIn("credentials", {
        email: userData.email,
        password: userData.password,
        redirect: false,
      });

      if (loginResult?.error) {
        setAuthError("Registrasi berhasil, silakan login manual");
        return false;
      }

      return true;
    } catch (error: any) {
      console.error("❌ [useBooking] handleRegister Error:", error);
      setAuthError(error.message || "Registrasi gagal");
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  /**
   * Submit booking
   */
  const submitBooking = useCallback(async (formData: BookingFormData): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const result = await createBookingFromForm(formData);
      setBookingResult(result);
      setBookingSuccess(true);
      return true;
    } catch (error: any) {
      console.error("❌ [useBooking] submitBooking Error:", error);
      setSubmitError(error.message || "Gagal membuat booking");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated]);

  /**
   * Reset error states
   */
  const resetErrors = useCallback(() => {
    setServicesError(null);
    setSubmitError(null);
    setAuthError(null);
  }, []);

  /**
   * Reset booking state for new booking
   */
  const resetBookingState = useCallback(() => {
    setBookingSuccess(false);
    setBookingResult(null);
    setSubmitError(null);
  }, []);

  // Load services on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    // State
    services,
    isLoadingServices,
    isSubmitting,
    isAuthenticating,
    servicesError,
    submitError,
    authError,
    bookingSuccess,
    bookingResult,
    
    // Actions
    fetchServices,
    handleLogin,
    handleRegister,
    submitBooking,
    resetErrors,
    resetBookingState,
  };
}
