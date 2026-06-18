import { Schedule } from '@/lib/types';
import { Calendar, Clock, MapPin, Video, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface NextMeetingCardProps {
    schedule: Schedule;
}

export function NextMeetingCard({ schedule }: NextMeetingCardProps) {
    const dateObj = new Date(schedule.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('id-ID', { month: 'short' });
    const fullDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 rounded-3xl shadow-sm border border-slate-150 dark:border-zinc-800 border-l-4 border-l-[#8CC540] overflow-hidden flex flex-col md:flex-row relative hover:shadow-md transition-shadow duration-300">
            {/* Background Pattern Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8CC540]/4 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

            {/* Date Box */}
            <div className="p-6 md:p-8 md:pr-0 flex md:flex-col items-center justify-center md:items-start md:justify-start gap-4 md:gap-1 min-w-[120px] relative z-10">
                <div className="flex flex-col items-center bg-[#8CC540]/8 rounded-2xl px-5 py-4 border border-[#8CC540]/15 min-w-[90px] shadow-sm">
                    <span className="text-[10px] font-black text-[#7ab32f] uppercase tracking-widest leading-none">{month}</span>
                    <span className="text-3xl font-black text-slate-800 dark:text-zinc-100 leading-none mt-2">{day}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 pt-0 md:pt-8 flex-1 flex flex-col justify-center relative z-10">
                <div className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#8CC540]/10 text-[#7ab32f] border border-[#8CC540]/20">
                        <Calendar size={11} />
                        Pertemuan Berikutnya
                    </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 mb-2 leading-tight tracking-tight">
                    {schedule.event}
                </h3>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 mb-6 font-semibold text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="text-[#8CC540]" size={16} />
                        <span className="font-extrabold text-slate-800 dark:text-zinc-200 text-base md:text-lg">{schedule.time} WIB</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500">
                        <Calendar size={15} />
                        <span>{fullDate}</span>
                    </div>
                </div>

                {/* Context & Action - Responsive Layout */}
                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    {schedule.isOnline ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                            <div className="flex items-center gap-2 text-[#8CC540] bg-[#8CC540]/8 border border-[#8CC540]/15 px-4 py-3 rounded-xl text-xs md:text-sm font-bold flex-1 w-full sm:w-auto">
                                <Video size={16} />
                                Online Meeting
                            </div>
                            {schedule.link && (
                                <a
                                    href={schedule.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8CC540] to-[#76a536] hover:from-[#76a536] hover:to-[#5b8e34] hover:shadow-md hover:shadow-lime-500/10 text-white px-6 py-3 rounded-xl text-xs md:text-sm font-black transition-all duration-300 w-full sm:w-auto active:scale-95 cursor-pointer shadow-sm"
                                >
                                    <Video size={16} />
                                    Join Google Meet
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 px-4 py-3 rounded-xl text-xs md:text-sm font-bold flex-1 w-full sm:w-auto">
                                <MapPin size={16} className="text-slate-400 dark:text-zinc-500" />
                                {schedule.location?.address || 'Lokasi belum ditentukan'}
                            </div>
                            <button className="inline-flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 border border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 px-6 py-3 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-300 w-full sm:w-auto active:scale-95 cursor-pointer shadow-sm">
                                <MapPin size={16} />
                                Lihat Peta Lokasi
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
