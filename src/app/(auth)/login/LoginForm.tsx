"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { auth, googleProvider } from "../../../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import "./login.css";

export default function LoginForm() {
    const searchParams = useSearchParams();

    // Perbaikan: Pastikan URL bersih dari karakter aneh seperti %2F  
    const callbackUrl = decodeURIComponent(searchParams.get("callbackUrl") || "/dashboard");

    // --- STATE ---
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "success",
    });

    // --- HELPER UNTUK TUTUP POPUP ---
    const closePopup = () => {
        setPopup({ ...popup, show: false });
        if (popup.type === "success") {
            // Replace browser history to prevent going back to login
            setTimeout(() => {
                window.history.replaceState({}, "", callbackUrl);
                window.location.href = callbackUrl;
            }, 500);
        }
    };

    // --- REGULAR EMAIL/PASSWORD HANDLER ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setPopup({
                    show: true,
                    message: "Login gagal. Periksa email dan password Anda.",
                    type: "error",
                });
            } else if (result?.ok) {
                // Replace history immediately to prevent back button issues
                window.history.replaceState({}, "", callbackUrl);
                setPopup({
                    show: true,
                    message: "Login Berhasil! Selamat datang.",
                    type: "success",
                });
            }
        } catch (error) {
            setPopup({ show: true, message: "Terjadi kesalahan.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    // --- GOOGLE LOGIN HANDLER (FIREBASE SDK) ---
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            // Panggil NextAuth, bukan langsung ke backend 5000
            const res = await signIn("credentials", {
                idToken,
                redirect: false
            });

            if (res?.error) throw new Error(res.error);
            window.history.replaceState({}, "", callbackUrl);
            window.location.href = callbackUrl;
        } catch (error: any) {
            setPopup({ show: true, message: "Gagal Login Google", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* POPUP */}
            {popup.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000]">
                    <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-[30px] rounded-xl text-center shadow-xl max-w-[400px] w-[80%]">
                        <h3 className={`text-xl font-bold mb-[10px] ${popup.type === "success" ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                            {popup.type === "success" ? "Berhasil!" : "Gagal!"}
                        </h3>
                        <p className="mb-[20px] text-slate-700 dark:text-zinc-300">{popup.message}</p>
                        <button onClick={closePopup} className={`border-none py-2.5 px-[20px] rounded-[6px] cursor-pointer font-bold text-white transition-colors ${popup.type === "success" ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700" : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"}`}>
                            Lanjut
                        </button>
                    </div>
                </div>
            )}

            {/* UI LOGIN TETAP SAMA */}
            <div className="left-container">
                <div className="brand-container">
                    <img src="/images/Cema_Logo.png" alt="logo" className="logo" />
                    <h1 className="brand">Cema<span className="highlight">Design</span></h1>
                </div>
                <div className="left-content">
                    <h2 className="h-content">Welcome Back!</h2>
                    {/* <p className="p-content">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p> */}
                </div>
            </div>

            <div className="right-container">
                <div className="login-form">
                    <p className="welcome-text">WELCOME BACK</p>
                    <h2>Log In to your Account</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-zinc-300">Email</label>
                            <input type="email" placeholder="name@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={isLoading} />
                        </div>

                        <div className="form-group" style={{ position: "relative" }}>
                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-zinc-300">Password</label>
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required disabled={isLoading} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] bg-transparent border-none cursor-pointer text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="form-options">
                            <label className="remember">
                                <input type="checkbox" style={{ width: "auto" }} /> Remember me
                            </label>
                            <div className="forgot" style={{ cursor: "pointer" }}>Forgot Password?</div>
                        </div>

                        <button type="submit" className="continue-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                            {isLoading ? "Loading..." : "Continue"}
                        </button>

                        <div className="divider">or continue with</div>
                        <div className="social-login">
                            <button type="button" className="google-btn" onClick={handleGoogleLogin} disabled={isLoading}>
                                <img src="../images/google.png" alt="Google" /> Continue with Google
                            </button>
                        </div>
                        <p className="signup">
                            New User? <Link href="/register" className="signup-link" style={{ marginLeft: "5px" }}>SIGN UP HERE</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
