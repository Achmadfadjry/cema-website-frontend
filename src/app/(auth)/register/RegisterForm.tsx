"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { auth, googleProvider } from "../../../lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function RegisterForm() {
    const searchParams = useSearchParams();
    const callbackUrl = decodeURIComponent(searchParams.get("callbackUrl") || "/dashboard");

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const closePopup = () => {
        setPopup({ ...popup, show: false });
        if (popup.type === "success") {
            window.location.href = callbackUrl;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok || data.status === "error") {
                setPopup({
                    show: true,
                    message: data.message || "Register gagal.",
                    type: "error",
                });
            } else {
                setPopup({
                    show: true,
                    message: "Register Berhasil! Selamat datang.",
                    type: "success",
                });
            }
        } catch (error) {
            setPopup({ show: true, message: "Terjadi kesalahan.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const res = await signIn("credentials", { idToken, redirect: false });
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

            <div className="left-container">
                <div className="brand-container">
                    <img src="/images/Cema_Logo.png" alt="logo" className="logo" />
                    <h1 className="brand">Cema<span className="highlight">Design</span></h1>
                </div>
                <div className="left-content">
                    <h2 className="h-content">Join Us!</h2>
                    {/* <p className="p-content">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p> */}
                </div>
            </div>

            <div className="right-container">
                <div className="login-form">
                    <p className="welcome-text">CREATE ACCOUNT</p>
                    <h2>Register your Account</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ position: "relative" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group" style={{ position: "relative" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group" style={{ position: "relative" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "38px", background: "none", border: "none", cursor: "pointer", color: "#666" }}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="form-group" style={{ position: "relative" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                placeholder="08xxxxxx"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <button type="submit" className="continue-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                            {isLoading ? "Loading..." : "Register"}
                        </button>

                        <div className="divider">or continue with</div>
                        <div className="social-login">
                            <button type="button" className="google-btn" onClick={handleGoogleLogin} disabled={isLoading}>
                                <img src="../images/google.png" alt="Google" /> Continue with Google
                            </button>
                        </div>
                        <p className="signup">
                            Already have an account? <Link href="/login" className="signup-link" style={{ marginLeft: "5px" }}>LOG IN HERE</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
