'use client';

import { Search, Plus, Filter } from 'lucide-react';
import { BRAND } from '../constants';

interface ToolbarProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    statusFilter: 'all' | 'active' | 'completed';
    setStatusFilter: (filter: 'all' | 'active' | 'completed') => void;
    projectCount: number;
}

export function Toolbar({ 
    searchQuery, 
    setSearchQuery, 
    statusFilter, 
    setStatusFilter,
    projectCount
}: ToolbarProps) {
    return (
        <div className="flex-none px-6 py-6 max-w-7xl w-full mx-auto">
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm rounded-2xl p-4 md:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md group">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-[#8CC540] transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari proyek..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 focus:border-[#8CC540] dark:focus:border-[#8CC540] rounded-xl text-xs md:text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[#8CC540]/8 transition-all duration-300 placeholder-slate-400 dark:placeholder-zinc-500 text-slate-700 dark:text-zinc-100 shadow-sm"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-200/40 dark:bg-zinc-950/40 border border-slate-200/20 dark:border-zinc-800/20 rounded-xl p-1 shadow-inner">
                            {(['all', 'active', 'completed'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`px-4 py-1.5 text-xs md:text-sm font-extrabold rounded-lg transition-all duration-300 ${
                                        statusFilter === filter 
                                            ? 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 shadow-sm border border-slate-100 dark:border-zinc-800' 
                                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-white/20 dark:hover:bg-zinc-800/20'
                                    }`}
                                >
                                    {filter === 'all' ? 'Semua' : filter === 'active' ? 'Aktif' : 'Selesai'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 lg:ml-auto justify-between lg:justify-end">
                        <span className="text-xs md:text-sm font-extrabold text-slate-400 dark:text-zinc-500 bg-white/80 dark:bg-zinc-950/80 border border-slate-200/50 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">{projectCount} proyek</span>
                        <button 
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-xs md:text-sm font-extrabold rounded-xl transition-all duration-300 shadow-md shadow-lime-500/15 hover:shadow-lime-500/25 bg-gradient-to-r from-[#8CC540] to-[#76a536] hover:from-[#76a536] hover:to-[#5b8e34] active:scale-95 cursor-pointer"
                        >
                            <Plus size={16} />
                            <span>New Project</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
