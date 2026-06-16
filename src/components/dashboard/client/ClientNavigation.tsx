'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clientNavTabs } from './navigationConfig';

export function ClientNavigation() {
    const pathname = usePathname();

    return (
        <div className="bg-slate-50 dark:bg-zinc-950 sticky top-16 md:top-[6.22vw] z-30 w-full transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <nav className="flex gap-2.5 overflow-x-auto py-1 hide-scrollbar" aria-label="Tabs">
                    {clientNavTabs.map((tab) => {
                        const isActive = tab.activeCheck(pathname);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`
                                    group inline-flex items-center gap-2 px-5 py-2 text-xs md:text-sm font-extrabold whitespace-nowrap rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95
                                    ${isActive
                                        ? 'bg-[#8CC540] text-white shadow-md shadow-lime-500/20'
                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 bg-slate-100/50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/40 dark:border-zinc-800/40 hover:border-slate-200/80 dark:hover:border-zinc-700/80 shadow-sm'
                                    }
                                `}
                            >
                                <span className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-500 dark:group-hover:text-zinc-400'}`}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
