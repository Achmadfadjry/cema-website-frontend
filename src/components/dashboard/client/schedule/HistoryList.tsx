'use client';

import { useState } from 'react';
import { Schedule } from '@/lib/types';
import { ChevronDown, ChevronUp, History, Video, MapPin, FileText } from 'lucide-react';

interface HistoryListProps {
    schedules: Schedule[];
}

export function HistoryList({ schedules }: HistoryListProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);

    if (schedules.length === 0) return null;

    // Sort descending for history (newest past item first)
    const sortedHistory = [...schedules].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Pagination Logic: Show first 5, or all if showAll is true
    const VISIBLE_COUNT = 5;
    const displayedHistory = showAll ? sortedHistory : sortedHistory.slice(0, VISIBLE_COUNT);
    const hasMore = sortedHistory.length > VISIBLE_COUNT;

    return (
        <div className="mt-12 border-t border-slate-200/80 dark:border-zinc-800 pt-8">
             <div className="mb-4">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100/50 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800 rounded-2xl transition-all duration-300 shadow-sm cursor-pointer group"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-zinc-950 p-2 rounded-xl border border-slate-200/40 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors shadow-sm">
                            <History size={15} />
                        </div>
                        <span className="text-xs md:text-sm font-extrabold text-slate-600 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors uppercase tracking-wider">
                            Riwayat Pertemuan
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-200/60 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-lg">
                            {schedules.length}
                        </span>
                    </div>
                    <div className="text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-400 transition-colors">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                </button>
             </div>

            {isOpen && (
                <div className="space-y-3 mt-4 animate-in slide-in-from-top-2 duration-300">
                    {displayedHistory.map(item => (
                        <HistoryItem key={item.id} schedule={item} />
                    ))}

                    {hasMore && (
                        <button 
                            onClick={() => setShowAll(!showAll)}
                            className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 uppercase tracking-wider bg-slate-50 dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 p-2.5 rounded-xl transition-all duration-300 hover:shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer ml-1"
                        >
                            {showAll ? "Tampilkan Lebih Sedikit" : `Tampilkan Semua Riwayat (${schedules.length - VISIBLE_COUNT} lagi)`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function HistoryItem({ schedule }: { schedule: Schedule }) {
    const dateObj = new Date(schedule.date);
    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Icon Selection - Grayscale
    let Icon = FileText;
    
    if (schedule.isOnline) {
        Icon = Video;
    } else if (schedule.location) {
        Icon = MapPin;
    }

    const isCancelled = schedule.status === 'cancelled';

    return (
        <div className="bg-slate-50/30 dark:bg-zinc-900/30 p-4 rounded-2xl border border-slate-100/80 dark:border-zinc-800/80 flex items-center gap-4 opacity-75 hover:opacity-100 transition-all duration-300 hover:shadow-sm">
            {/* Grayscale Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100/60 dark:bg-zinc-950/60 border border-slate-200/40 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 shadow-inner">
                <Icon size={16} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h5 className={`font-bold text-slate-600 dark:text-zinc-400 text-sm md:text-base truncate ${isCancelled ? 'line-through decoration-red-350 dark:decoration-red-800 text-slate-400 dark:text-zinc-500' : ''}`}>
                        {schedule.event}
                    </h5>
                    
                    {/* Status Badges */}
                    {isCancelled && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/30 px-1.5 py-0.5 rounded-md">
                            Dibatalkan
                        </span>
                    )}
                    {schedule.status === 'done' && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-800 px-1.5 py-0.5 rounded-md">
                            Selesai
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 mt-1">
                    <span>{dateStr}</span>
                    <span>•</span>
                    <span>{schedule.time} WIB</span>
                </div>
            </div>
        </div>
    );
}
