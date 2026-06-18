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
  Search,
} from "lucide-react";

interface AdminChatMessage extends Omit<ChatMessage, 'senderRole'> {
  isEdited?: boolean;
  isDeleted?: boolean;
  senderRole?: string;
}

export default function ChatClientPage() {
  const [clients, setClients] = useState<ChatClient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<{ id: string; timestamp: Date } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatsRef = ref(db, "chata");
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedClients: ChatClient[] = [];

      if (data) {
        Object.keys(data).forEach((key) => {
          const meta = data[key].meta;
          if (meta) {
            loadedClients.push({
              id: key,
              name: meta.userName || meta.name || "Guest User",
              lastMessage: meta.lastMessage,
              unreadCount: meta.unreadCount || 0,
              online: true,
              timestamp: meta.timestamp || meta.lastTimestamp || 0,
            });
          }
        });
      }
      
      // Sort by timestamp descending (newest first)
      loadedClients.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      setClients(loadedClients);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedClientId) return;

    // Reset unread count when opening the chat
    update(ref(db, `chata/${selectedClientId}/meta`), {
      unreadCount: 0,
    });

    const messagesRef = ref(db, `chata/${selectedClientId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      // Clear unread count when new messages arrive while this room is active
      update(ref(db, `chata/${selectedClientId}/meta`), {
        unreadCount: 0,
      });

      const msgsData = snapshot.val();
      const loadedMessages: AdminChatMessage[] = [];

      if (msgsData) {
        Object.keys(msgsData).forEach((key) => {
          const m = msgsData[key];
          const isFromClient = m.sender === "user" || m.sender === "client";
          loadedMessages.push({
            id: key,
            senderId: isFromClient ? (selectedClientId as string) : "admin",
            senderName: isFromClient ? "Client" : "Admin",
            senderRole: isFromClient ? "USER" : "ADMIN",
            receiverId: isFromClient ? "admin" : (selectedClientId as string),
            message: m.text || "",
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            isAdmin: m.sender === "agent" || m.sender === "admin",
            read: m.read || false,
            isEdited: m.isEdited || false,
            isDeleted: m.isDeleted || false,
          } as AdminChatMessage);
        });

        // Sort messages chronologically by timestamp
        loadedMessages.sort((a, b) => {
          const t1 = a.timestamp ? a.timestamp.getTime() : 0;
          const t2 = b.timestamp ? b.timestamp.getTime() : 0;
          return (isNaN(t1) ? 0 : t1) - (isNaN(t2) ? 0 : t2);
        });

        const normalize = (txt: string) => (txt || "").toLowerCase().replace(/\s+/g, "").trim();

        // Deduplicate consecutive identical messages from the same sender within 5 minutes
        const deduplicatedMessages: AdminChatMessage[] = [];
        loadedMessages.forEach((msg) => {
          if (deduplicatedMessages.length === 0) {
            deduplicatedMessages.push(msg);
          } else {
            const prevMsg = deduplicatedMessages[deduplicatedMessages.length - 1];
            const t1 = msg.timestamp ? msg.timestamp.getTime() : 0;
            const t2 = prevMsg.timestamp ? prevMsg.timestamp.getTime() : 0;
            const ms1 = isNaN(t1) ? 0 : t1;
            const ms2 = isNaN(t2) ? 0 : t2;

            const isDuplicate =
              msg.isAdmin === prevMsg.isAdmin &&
              normalize(msg.message) === normalize(prevMsg.message) &&
              (ms1 === 0 || ms2 === 0 || Math.abs(ms1 - ms2) < 300000); // 5 minutes

            if (!isDuplicate) {
              deduplicatedMessages.push(msg);
            }
          }
        });

        console.log("DEBUG CHAT-CLIENT: loadedMessages =", loadedMessages);
        console.log("DEBUG CHAT-CLIENT: deduplicatedMessages =", deduplicatedMessages);

        setMessages(deduplicatedMessages);
      } else {
        setMessages([]);
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedClientId]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedClientId) return;

    const chatRef = ref(db, `chata/${selectedClientId}/messages`);
    push(chatRef, {
      sender: "agent",
      text: inputText,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: new Date().toISOString(),
    });

    update(ref(db, `chata/${selectedClientId}/meta`), {
      lastMessage: `Admin: ${inputText}`,
      lastTimestamp: serverTimestamp(),
      timestamp: serverTimestamp(),
    });

    setInputText("");
  };

  const isWithin5Minutes = (timestamp: Date) => {
    if (!timestamp) return false;
    const diff = (new Date().getTime() - timestamp.getTime()) / (1000 * 60);
    return diff <= 5;
  };

  const handleDeleteMessage = (id: string, timestamp: Date) => {
    if (!selectedClientId) return;
    if (!isWithin5Minutes(timestamp)) {
      alert("Pesan hanya dapat dihapus dalam 5 menit!");
      return;
    }
    setMessageToDelete({ id, timestamp });
  };

  const confirmDeleteMessage = () => {
    if (!selectedClientId || !messageToDelete) return;
    update(ref(db, `chata/${selectedClientId}/messages/${messageToDelete.id}`), {
      text: "🗑️ Pesan dihapus oleh admin",
      isDeleted: true,
    }).then(() => {
      setMessageToDelete(null);
    }).catch((err) => {
      console.error(err);
      alert("Gagal menghapus pesan");
      setMessageToDelete(null);
    });
  };

  const handleStartEdit = (id: string, currentText: string, timestamp: Date) => {
    if (!isWithin5Minutes(timestamp)) {
      alert("Pesan hanya dapat diedit dalam 5 menit!");
      return;
    }
    setEditingMessageId(id);
    setEditingText(currentText);
  };

  const handleSaveEdit = (id: string) => {
    if (!selectedClientId || !editingText.trim()) return;

    update(ref(db, `chata/${selectedClientId}/messages/${id}`), {
      text: editingText.trim(),
      isEdited: true,
    }).then(() => {
      setEditingMessageId(null);
      setEditingText("");
    }).catch((err) => {
      console.error(err);
      alert("Gagal mengedit pesan");
    });
  };

  const requestDeleteChat = () => {
    if (!selectedClientId) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteChat = () => {
    if (!selectedClientId) return;

    remove(ref(db, `chata/${selectedClientId}`))
      .then(() => {
        setIsDeleteModalOpen(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        setSelectedClientId(null);
        setMessages([]);
      })
      .catch((err) => {
        console.error(err);
        alert("Gagal menghapus sesi chat.");
        setIsDeleteModalOpen(false);
      });
  };

  // Filter clients based on search query
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Delete Message Confirmation Modal */}
      {messageToDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200 text-center transition-colors duration-300">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-zinc-100 tracking-tight">
              Hapus Chat?
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 mb-6 leading-relaxed">
              Apakah kamu yakin menghapus chat ini?
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setMessageToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteMessage}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
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
        <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-300 space-y-3">
          <h2 className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2 text-sm">
            <MessageSquare size={16} className="text-primary" />
            Antrian Chat
          </h2>
          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Cari nama klien..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-xs font-medium text-slate-800 dark:text-zinc-200 transition-all placeholder-slate-400 dark:placeholder-zinc-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 scrollbar-thin">
          {filteredClients.length === 0 && (
            <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs italic">
              Belum ada pesan masuk.
            </div>
          )}
          {filteredClients.map((client) => {
            const isSelected = selectedClientId === client.id;
            return (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`p-4 cursor-pointer transition-all border-l-4 
                  ${isSelected
                    ? "bg-primary/10 dark:bg-primary/20 border-l-primary text-primary"
                    : "border-l-transparent text-slate-600 dark:text-zinc-400 hover:bg-slate-100/40 dark:hover:bg-zinc-800/25"
                  }`}
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <span
                    className={`font-bold text-xs truncate ${isSelected ? "text-primary dark:text-primary-hover" : "text-slate-800 dark:text-zinc-250"
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
              {(() => {
                const norm = (txt: string) => (txt || "").toLowerCase().replace(/\s+/g, "").trim();
                const deduplicated: typeof messages = [];
                messages.forEach((msg) => {
                  if (deduplicated.length === 0) {
                    deduplicated.push(msg);
                  } else {
                    const prevMsg = deduplicated[deduplicated.length - 1];
                    const t1 = msg.timestamp ? new Date(msg.timestamp).getTime() : 0;
                    const t2 = prevMsg.timestamp ? new Date(prevMsg.timestamp).getTime() : 0;
                    const ms1 = isNaN(t1) ? 0 : t1;
                    const ms2 = isNaN(t2) ? 0 : t2;

                    const isDuplicate =
                      msg.isAdmin === prevMsg.isAdmin &&
                      norm(msg.message) === norm(prevMsg.message) &&
                      (ms1 === 0 || ms2 === 0 || Math.abs(ms1 - ms2) < 300000); // 5 minutes

                    if (!isDuplicate) {
                      deduplicated.push(msg);
                    }
                  }
                });

                return deduplicated.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-xs font-medium border ${msg.isAdmin
                          ? msg.isDeleted
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 italic border-zinc-200 dark:border-zinc-800 rounded-tr-none"
                            : "bg-gradient-to-br from-primary to-primary-dark border-primary/20 text-white rounded-tr-none shadow-primary/5"
                          : msg.isDeleted
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 italic border-zinc-200 dark:border-zinc-800 rounded-tl-none"
                            : "bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-tl-none"
                        }`}
                    >
                      {editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            rows={2}
                            className="w-full resize-none bg-white/10 border border-white/20 rounded p-2 text-white text-xs outline-none focus:ring-1 focus:ring-white"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEdit(msg.id);
                              }
                              if (e.key === "Escape") {
                                setEditingMessageId(null);
                                setEditingText("");
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditingText("");
                              }}
                              className="text-[10px] bg-white/20 text-white px-2 py-1 rounded hover:bg-white/30 font-bold transition-colors"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSaveEdit(msg.id)}
                              className="text-[10px] bg-white text-primary px-2 py-1 rounded hover:bg-white/90 font-bold transition-colors"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="leading-relaxed break-words">
                            {msg.message}
                            {msg.isEdited && (
                              <span className="text-[9px] opacity-75 block text-right mt-0.5 italic">
                                (diedit)
                              </span>
                            )}
                          </p>
                          <p
                            className={`text-[9px] mt-1 text-right font-bold ${msg.isAdmin
                                ? msg.isDeleted
                                  ? "text-zinc-400 dark:text-zinc-500"
                                  : "text-white/80"
                                : "text-slate-400 dark:text-zinc-500"
                              }`}
                          >
                            {msg.timestamp.toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {msg.isAdmin &&
                            !msg.isDeleted &&
                            isWithin5Minutes(msg.timestamp) && (
                              <div className="flex justify-end gap-3 mt-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    handleStartEdit(msg.id, msg.message, msg.timestamp)
                                  }
                                  className="text-[9px] text-white/80 hover:text-white font-bold cursor-pointer underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.id, msg.timestamp)}
                                  className="text-[9px] text-white/80 hover:text-red-200 font-bold cursor-pointer underline"
                                >
                                  Hapus
                                </button>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                ));
              })()}
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
