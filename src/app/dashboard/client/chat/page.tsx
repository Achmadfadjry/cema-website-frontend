"use strict";
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { ref, push, onValue, serverTimestamp, update, off } from "firebase/database";
import { Send, Loader2, User, Bot } from "lucide-react";

interface Message {
    id: string;
    text: string;
    sender: "client" | "admin";
    timestamp: number;
}

export default function ChatPage() {
    const { data: session, status } = useSession();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userId = session?.user?.id; // Assuming user ID is available in session

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (status === "loading") return;
        if (!userId) {
            setLoading(false);
            return;
        }

        const messagesRef = ref(db, `chata/${userId}/messages`);

        const listener = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedMessages = Object.entries(data).map(([key, value]: [string, any]) => ({
                    id: key,
                    ...value,
                }));
                // Sort by timestamp just in case
                loadedMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                setMessages(loadedMessages);
            } else {
                setMessages([]);
            }
            setLoading(false);
        });

        return () => {
            off(messagesRef, "value", listener);
        };
    }, [userId, status]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !userId) return;

        const messageText = input.trim();
        setInput(""); // Clear input immediately

        try {
            // 1. Push message
            const messagesRef = ref(db, `chata/${userId}/messages`);
            await push(messagesRef, {
                text: messageText,
                sender: "client",
                timestamp: serverTimestamp(),
            });

            // 2. Update metadata for Admin list
            const metaRef = ref(db, `chata/${userId}/meta`);
            await update(metaRef, {
                lastMessage: messageText,
                timestamp: serverTimestamp(),
                userName: session?.user?.name || "Client",
                userEmail: session?.user?.email || "",
                unreadCount: 1,
            });
        } catch (error) {
            console.error("Error sending message:", error);
            // Optional: Show error toast
        }
    };

    if (status === "loading") {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full animate-in fade-in duration-300">
                <div className="flex h-[calc(100vh-15rem)] min-h-[500px] items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full animate-in fade-in duration-300">
                <div className="flex h-[calc(100vh-15rem)] min-h-[500px] items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-10 text-center text-slate-400 dark:text-zinc-500 font-semibold text-sm">
                    Please sign in to chat with support.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full h-[calc(100vh-15rem)] min-h-[550px] flex flex-col animate-in fade-in duration-500">
            <div className="relative flex-1 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-colors duration-300">
                {/* Header Chat */}
                <div className="h-16 border-b border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center gap-3 transition-colors duration-300 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 relative">
                        <Bot className="h-5.5 w-5.5" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                            Support Team
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">We usually reply within a few minutes</span>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 dark:bg-zinc-900/5 min-h-0 scrollbar-thin">
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 p-8 text-center my-auto min-h-[300px]">
                            <div className="p-4 bg-primary/10 dark:bg-primary/20 text-primary rounded-full mb-4 border border-primary/20">
                                <Bot size={32} />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm tracking-tight mb-1">Mulai Obrolan</h4>
                            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 max-w-[220px] leading-relaxed">Kami di sini untuk membantu Anda dengan pertanyaan apa pun mengenai proyek Anda.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isClient = msg.sender === "client";
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isClient ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-xs font-medium border ${isClient
                                            ? "bg-gradient-to-br from-primary to-primary-dark border-primary/20 text-white rounded-tr-none shadow-primary/5"
                                            : "bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-tl-none"
                                            }`}
                                    >
                                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                                        <p
                                            className={`text-[9px] mt-1 text-right font-bold ${isClient ? "text-white/80" : "text-slate-400 dark:text-zinc-500"
                                                }`}
                                        >
                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-200/80 dark:border-zinc-800 transition-colors duration-300 shrink-0">
                    <form onSubmit={sendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ketik pesan..."
                            className="flex-1 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/45 text-xs font-medium placeholder-slate-400 dark:placeholder-zinc-500"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20 flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
                        >
                            <Send size={15} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

