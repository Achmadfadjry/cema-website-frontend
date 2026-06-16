import { Schedule } from '@/lib/types';
import { Video, MapPin, FileText, Calendar, ChevronRight } from 'lucide-react';

interface UpcomingListProps {
    schedules: Schedule[];
}

export function UpcomingList({ schedules }: UpcomingListProps) {
    // 1. Sort by date ascending
    const sorted = [...schedules].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Grouping Logic
    const groups: { [key: string]: Schedule[] } = {
        'Minggu Ini': [],
        'Bulan Ini': [],
        'Mendatang': []
    };

    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

    // Reset now for comparisson
    const today = new Date();

    sorted.forEach(item => {
        const d = new Date(item.date);

        // Skip past events? typically "Upcoming" list implies future. 
        // But for safe measure let's include all pending/scheduled ones or today onwards.
        // Assuming the parent component passes appropriate list, or we filter here.
        if (d < new Date(new Date().setHours(0, 0, 0, 0))) return;

        const isThisWeek = d >= today && d <= endOfWeek;
        const isThisMonth = d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

        if (isThisWeek) {
            groups['Minggu Ini'].push(item);
        } else if (isThisMonth) {
            groups['Bulan Ini'].push(item);
        } else {
            groups['Mendatang'].push(item);
        }
    });

    // Remove empty groups
    const activeGroups = Object.entries(groups).filter(([_, items]) => items.length > 0);

    return (
        <div className="space-y-6 mt-8">
            <h3 className="text-xs md:text-sm font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                Jadwal Lainnya
            </h3>

            {activeGroups.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 dark:bg-zinc-900/50 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl">
                    <p className="text-slate-400 dark:text-zinc-500 text-xs md:text-sm font-medium">Tidak ada jadwal mendatang lainnya.</p>
                </div>
            ) : (
                activeGroups.map(([label, items]) => (
                    <div key={label} className="space-y-3">
                        <h4 className="text-[10px] font-extrabold text-[#8CC540] uppercase tracking-wider px-1 mt-6 first:mt-0">{label}</h4>
                        <div className="space-y-3">
                            {items.map(item => (
                                <UpcomingItem key={item.id} schedule={item} />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

function UpcomingItem({ schedule }: { schedule: Schedule }) {
    const dateObj = new Date(schedule.date);
    const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });

    // Icon Selection
    let Icon = FileText;
    let iconBg = "bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800";

    if (schedule.isOnline) {
        Icon = Video;
        iconBg = "bg-[#8CC540]/8 text-[#8CC540] border border-[#8CC540]/15";
    } else if (schedule.location) {
        Icon = MapPin;
        iconBg = "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30";
    }

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-[#8CC540]/35 transition-all duration-300 group flex items-center gap-4 cursor-pointer hover:-translate-y-0.5">
            {/* Date Badge */}
            <div className="flex flex-col items-center justify-center min-w-[55px] border-r border-slate-100 dark:border-zinc-800 pr-4">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-tight leading-none">{dayName.split(',')[0]}</span>
                <span className="text-xl font-black text-slate-800 dark:text-zinc-100 mt-1.5 leading-none">{dateObj.getDate()}</span>
            </div>

            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${iconBg}`}>
                <Icon size={16} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h5 className="font-bold text-slate-800 dark:text-zinc-150 truncate group-hover:text-[#8CC540] transition-colors leading-tight text-sm md:text-base">{schedule.event}</h5>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 mt-1.5">
                    <span className="text-slate-600 dark:text-zinc-300">{schedule.time} WIB</span>
                    <span>•</span>
                    <span className="truncate">
                        {schedule.isOnline ? 'Online Meeting' : (schedule.location?.address || 'Tatap Muka')}
                    </span>
                </div>
            </div>

            <div className="text-slate-300 dark:text-zinc-700 group-hover:text-[#8CC540] group-hover:translate-x-1 transition-all duration-300">
                <ChevronRight size={18} />
            </div>
        </div>
    );
}
