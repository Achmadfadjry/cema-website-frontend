"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { auth, googleProvider } from "../../../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import "../login/login.css";

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
                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-zinc-300">Name</label>
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
                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-zinc-300">Email</label>
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
                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-zinc-300">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] bg-transparent border-none cursor-pointer text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="form-group" style={{ position: "relative" }}>
                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-zinc-300">Phone Number</label>
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
