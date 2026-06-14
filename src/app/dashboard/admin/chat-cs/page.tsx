"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  ref,
  onValue,
  push,
  update,
  remove,
  serverTimestamp,
} from "firebase/database";
import type { ChatClient, ChatMessage } from "@/lib/types";
import {
  Trash2,
  Send,
  User,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function CSChatPage() {
  const [clients, setClients] = useState<ChatClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatsRef = ref(db, "chats");
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedClients: ChatClient[] = [];

      if (data) {
        Object.keys(data).forEach((key) => {
          const meta = data[key].meta;
          if (meta) {
            loadedClients.push({
              id: key,
              name: meta.name || "Guest User",
              lastMessage: meta.lastMessage,
              unreadCount: meta.unreadCount || 0,
              online: true,
            });
          }
        });
      }
      setClients(loadedClients.reverse());
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedClientId) return;

    // Reset unread count when opening the chat
    update(ref(db, `chats/${selectedClientId}/meta`), {
      unreadCount: 0,
    });

    const messagesRef = ref(db, `chats/${selectedClientId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      // Clear unread count when new messages arrive while this room is active
      update(ref(db, `chats/${selectedClientId}/meta`), {
        unreadCount: 0,
      });

      const msgsData = snapshot.val();
      const loadedMessages: ChatMessage[] = [];

      if (msgsData) {
        Object.keys(msgsData).forEach((key) => {
          const m = msgsData[key];
          loadedMessages.push({
            id: key,
            senderId:
              m.sender === "user" ? (selectedClientId as string) : "admin",
            senderName: m.sender === "user" ? "Client" : "Admin",
            senderRole: (m.sender === "user" ? "USER" : "ADMIN") as any,
            receiverId:
              m.sender === "user" ? "admin" : (selectedClientId as string),
            message: m.text || "",
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            isAdmin: m.sender === "agent" || m.sender === "admin",
            read: m.read || false,
          });
        });
      }
      setMessages(loadedMessages);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedClientId]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedClientId) return;

    const chatRef = ref(db, `chats/${selectedClientId}/messages`);
    push(chatRef, {
      sender: "agent",
      text: inputText,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: new Date().toISOString(),
    });

    update(ref(db, `chats/${selectedClientId}/meta`), {
      lastMessage: `Admin: ${inputText}`,
      lastTimestamp: serverTimestamp(),
    });

    setInputText("");
  };

  const requestDeleteChat = () => {
    if (!selectedClientId) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteChat = () => {
    if (!selectedClientId) return;

    remove(ref(db, `chats/${selectedClientId}`))
      .then(() => {
        setIsDeleteModalOpen(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        setSelectedClientId(null);
        setMessages([]);
      })
      .catch((err) => {
        console.error(err);
        alert("Gagal menghapus");
        setIsDeleteModalOpen(false);
      });
  };

  return (
    <div className="relative w-full h-[calc(100vh-12rem)] min-h-[500px] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm flex overflow-hidden transition-colors duration-300">
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200 text-center transition-colors duration-300">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-zinc-100 tracking-tight">
              Hapus Sesi Chat?
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 mb-6 leading-relaxed">
              Riwayat percakapan dengan klien ini akan dihapus secara permanen dari server.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteChat}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-green-600 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold">
            <CheckCircle size={16} />
            <span>Sesi chat berhasil dihapus!</span>
          </div>
        </div>
      )}

      {/* --- SIDEBAR LIST CLIENT --- */}
      <div className="w-80 border-r border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10 transition-colors duration-300">
          <h2 className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2 text-sm">
            <MessageSquare size={16} className="text-primary" />
            Antrian Chat CS
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 scrollbar-thin">
          {clients.length === 0 && (
            <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs italic">
              Belum ada pesan masuk.
            </div>
          )}
          {clients.map((client) => {
            const isSelected = selectedClientId === client.id;
            return (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`p-4 cursor-pointer transition-all border-l-4 
                  ${
                    isSelected
                      ? "bg-primary/10 dark:bg-primary/20 border-l-primary text-primary"
                      : "border-l-transparent text-slate-600 dark:text-zinc-400 hover:bg-slate-100/40 dark:hover:bg-zinc-800/25"
                  }`}
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <span
                    className={`font-bold text-xs truncate ${
                      isSelected ? "text-primary dark:text-primary-hover" : "text-slate-800 dark:text-zinc-250"
                    }`}
                  >
                    {client.name}
                  </span>
                  {client.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                      {client.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate leading-tight">
                  {client.lastMessage}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/30 dark:bg-zinc-900/10 min-w-0">
        {selectedClientId ? (
          <>
            {/* Header Chat */}
            <div className="h-16 border-b border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex justify-between items-center transition-colors duration-300 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <User size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                    {clients.find((c) => c.id === selectedClientId)?.name}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={requestDeleteChat}
                className="flex items-center gap-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-2 rounded-xl text-xs font-bold border border-transparent hover:border-red-200/50 dark:hover:border-red-900/30 transition-all cursor-pointer"
              >
                <Trash2 size={13} />
                Hapus Sesi
              </button>
            </div>

            {/* Messages List Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-xs font-medium border ${
                      msg.isAdmin
                        ? "bg-gradient-to-br from-primary to-primary-dark border-primary/20 text-white rounded-tr-none shadow-primary/5"
                        : "bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-tl-none"
                    }`}
                  >
                    <p className="leading-relaxed break-words">{msg.message}</p>
                    <p
                      className={`text-[9px] mt-1 text-right font-bold ${
                        msg.isAdmin ? "text-white/85" : "text-slate-400 dark:text-zinc-500"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-200/80 dark:border-zinc-800 transition-colors duration-300 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ketik balasan..."
                  className="flex-1 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/45 text-xs font-medium placeholder-slate-400 dark:placeholder-zinc-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20 flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-900/40 transition-colors duration-300 p-8 text-center">
            <div className="p-4 bg-primary/10 dark:bg-primary/20 text-primary rounded-full mb-4 border border-primary/20">
              <MessageSquare size={32} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-zinc-250 text-sm tracking-tight mb-1">Mulai Obrolan</h4>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 max-w-[200px] leading-relaxed">Pilih client di sebelah kiri untuk memulai chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}
