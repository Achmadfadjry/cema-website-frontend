'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
    activeDates: string[]; // ISO Date strings YYYY-MM-DD
}

export function MiniCalendar({ activeDates }: MiniCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

    // Generate Calendar Grid
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const isToday = (d: number) => {
        const today = new Date();
        return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    const hasEvent = (d: number) => {
        // Construct ISO string YYYY-MM-DD for comparison
        // Note: activeDates are expected to be YYYY-MM-DD
        const checkDate = new Date(year, month, d);
        // Correctly offset timezone or just compare parts? 
        // Simplest: format checkDate to YYYY-MM-DD locally
        // But activeDates from DB are YYYY-MM-DD from API mapping (date part only).
        const y = checkDate.getFullYear();
        const m = String(checkDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d).padStart(2, '0');
        const iso = `${y}-${m}-${dayStr}`;
        
        return activeDates.includes(iso);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 dark:text-zinc-100 capitalize text-sm tracking-tight">{monthName}</h3>
                <div className="flex gap-1.5">
                    <button onClick={handlePrev} className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200 rounded-lg text-slate-400 dark:text-zinc-500 transition-all border border-slate-100 dark:border-zinc-800 hover:border-slate-200 dark:hover:border-zinc-705 shadow-sm cursor-pointer">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={handleNext} className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200 rounded-lg text-slate-400 dark:text-zinc-500 transition-all border border-slate-100 dark:border-zinc-800 hover:border-slate-200 dark:hover:border-zinc-705 shadow-sm cursor-pointer">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-2">
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
                    <span key={i} className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{d}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
                {days.map((day, idx) => (
                    <div key={idx} className="relative flex flex-col items-center justify-center h-10 w-10">
                        {day ? (
                            <>
                                <span className={`
                                    w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-300
                                    ${isToday(day) 
                                        ? 'bg-[#8CC540] text-white shadow-md shadow-[#8CC540]/30' 
                                        : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                    }
                                `}>
                                    {day}
                                </span>
                                {hasEvent(day) && (
                                    <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isToday(day) ? 'bg-white' : 'bg-[#8CC540]'}`}></span>
                                )}
                            </>
                        ) : (
                            <span />
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#8CC540] shadow-sm shadow-[#8CC540]/20"></span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider">Jadwal Aktif</span>
                </div>
                 <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-snug font-medium">
                    Kalender ini hanya untuk referensi visual jadwal Anda.
                </p>
            </div>
        </div>
    );
}
