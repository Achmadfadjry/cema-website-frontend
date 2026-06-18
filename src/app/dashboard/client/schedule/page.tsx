import { getSchedules } from '@/lib/api/schedules';
import { NextMeetingCard } from '@/components/dashboard/client/schedule/NextMeetingCard';
import { UpcomingList } from '@/components/dashboard/client/schedule/UpcomingList';
import { HistoryList } from '@/components/dashboard/client/schedule/HistoryList';
import { MiniCalendar } from '@/components/dashboard/client/schedule/MiniCalendar';
import { Calendar } from 'lucide-react';
import { Schedule } from '@/lib/types';

export default async function SchedulePage() {
    const schedules = await getSchedules();

    // Logic: Find Next Meeting & Upcoming List
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    // Sort ascending for date calculations
    const sortedSchedules = [...schedules].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 1. Separate Active vs History
    const activeUpcoming: Schedule[] = [];
    const history: Schedule[] = [];

    sortedSchedules.forEach(item => {
        const itemDate = new Date(item.date);
        // History Logic: 
        // - Date is strictly in past (yesterday or older)
        // - OR Status is completed/cancelled
        const isPastDate = itemDate < now;
        const isHistoryStatus = item.status === 'done' || item.status === 'cancelled';

        if (isPastDate || isHistoryStatus) {
            history.push(item);
        } else {
            activeUpcoming.push(item);
        }
    });
    
    // 2. Next Meeting (First item of Active)
    const nextMeeting = activeUpcoming[0];

    // 3. Remaining Items for List (Exclude the one in Hero if exists)
    const upcomingList = nextMeeting 
        ? activeUpcoming.filter(s => s.id !== nextMeeting.id) 
        : [];

    // 4. All dates for Calendar dots
    const activeDates = schedules.map(s => s.date);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* Header - Mobile Only (Optional context) */}
            <div className="lg:hidden mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                    <Calendar className="text-[#8CC540]" size={24} />
                    Agenda Saya
                </h2>
                <span className="text-sm font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                    {activeUpcoming.length}
                </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT COLUMN: Agenda Stream (70%) */}
                <div className="flex-1 min-w-0">
                    {nextMeeting ? (
                        <>
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-4 hidden lg:block">Pertemuan Berikutnya</h2>
                                <NextMeetingCard schedule={nextMeeting} />
                            </div>
                            
                            <UpcomingList schedules={upcomingList} />
                            
                            <HistoryList schedules={history} />
                        </>
                    ) : (
                        // Empty State if no future meetings at all
                        <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
                            <Calendar className="mx-auto text-gray-300 dark:text-zinc-700 mb-4" size={64} />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Tidak Ada Jadwal Mendatang</h3>
                            <p className="text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mt-2 mb-8">
                                Saat ini Anda tidak memiliki jadwal pertemuan aktif. Hubungi manajer proyek Anda untuk menjadwalkan konsultasi.
                            </p>
                            
                            {/* Show History even if Empty State */}
                            <div className="max-w-md mx-auto text-left">
                                <HistoryList schedules={history} />
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Mini Calendar (30%) - Hidden on Mobile */}
                <div className="hidden lg:block w-80 shrink-0">
                    <MiniCalendar activeDates={activeDates} />
                </div>
            </div>
        </div>
    );
}
