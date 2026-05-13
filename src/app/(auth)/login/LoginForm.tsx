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
            // Gunakan window.location agar Middleware tidak mencegat
            window.location.href = callbackUrl;
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
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                    <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", maxWidth: "400px", width: "80%" }}>
                        <h3 style={{ color: popup.type === "success" ? "#2ecc71" : "#e74c3c", marginBottom: "10px" }}>
                            {popup.type === "success" ? "Berhasil!" : "Gagal!"}
                        </h3>
                        <p style={{ marginBottom: "20px", color: "#333" }}>{popup.message}</p>
                        <button onClick={closePopup} style={{ backgroundColor: popup.type === "success" ? "#2ecc71" : "#e74c3c", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
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
                    <p className="p-content">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                </div>
            </div>

            <div className="right-container">
                <div className="login-form">
                    <p className="welcome-text">WELCOME BACK</p>
                    <h2>Log In to your Account</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Email</label>
                            <input type="email" placeholder="name@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={isLoading} />
                        </div>

                        <div className="form-group" style={{ position: "relative" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Password</label>
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required disabled={isLoading} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "38px", background: "none", border: "none", cursor: "pointer", color: "#666" }}>
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
                            <button type="button" className="facebook-btn" onClick={() => signIn("facebook", { callbackUrl })}>
                                <img src="../images/facebook.png" alt="Facebook" /> Continue with Facebook
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
