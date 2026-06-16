'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';
import type { Project } from '../types';
import { BRAND, WORK_PHASE_LABELS, getStatusConfig } from '../constants';

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    // Mapping Backend Data to UI
    const title = project.name;
    // const location = project.location?.address || 'Unknown Location';
    const image = project.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'; // Fallback
    const workPhase = project.workPhase || 'LEAD';
    const statusLabel = project.statusLabel || project.status; // Use status as label if no specific label
    const lastUpdate = project.lastUpdate || 'Recently';

    // Status Config
    // Ensure mapping exists, or provide default
    const statusConfig = getStatusConfig(project.status as any) || getStatusConfig('new');

    // Permission Check
    // Example: const canEdit = project.permissions?.canEdit;

    const phaseColor = (WORK_PHASE_LABELS[workPhase] || WORK_PHASE_LABELS['LEAD']).color;
    const phaseLabel = (WORK_PHASE_LABELS[workPhase] || WORK_PHASE_LABELS['LEAD']).label;

    return (
        <Link
            href={`/dashboard/client/my-project/${project.id}`}
            className="block h-full group"
        >
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-150 dark:border-zinc-800 overflow-hidden shadow-sm shadow-slate-100/40 hover:shadow-2xl dark:hover:shadow-[#8CC540]/10 hover:shadow-[#8CC540]/6 hover:border-[#8CC540]/30 hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-sm ${statusConfig.textClass} text-[11px] font-extrabold uppercase tracking-wider rounded-full border border-slate-200/50 dark:border-zinc-800`}>
                        {statusConfig.icon}
                        <span>{statusLabel}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-lg mb-1.5 group-hover:text-[#8CC540] transition-colors line-clamp-1 leading-tight tracking-tight">
                            {title}
                        </h3>
                        
                        <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-400 text-xs mb-4 font-semibold">
                            <MapPin size={13} className="shrink-0 text-slate-400 dark:text-zinc-500" />
                            <span className="truncate">{project.location?.address || 'Unknown Location'}</span>
                        </div>

                        {/* Work Phase Badge */}
                        <div className="mb-5">
                            <span
                                className="inline-flex items-center px-3 py-1 text-[11px] font-extrabold rounded-xl border uppercase tracking-wider"
                                style={{ 
                                    backgroundColor: `${phaseColor}09`,
                                    borderColor: `${phaseColor}20`,
                                    color: phaseColor
                                }}
                            >
                                {phaseLabel}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar & Footer */}
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between text-[11px] font-extrabold text-slate-400 dark:text-zinc-500 mb-2 tracking-wider">
                                <span>PROGRESS</span>
                                <span className="font-black text-slate-800 dark:text-zinc-200">{project.progress}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-100/60 dark:bg-zinc-950/60 border border-slate-200/20 dark:border-zinc-800/80 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${project.progress}%`,
                                        backgroundColor: project.status === 'attention' ? '#ef4444' : BRAND.primary,
                                        boxShadow: project.status === 'attention' ? '0 0 8px rgba(239, 68, 68, 0.4)' : '0 0 8px rgba(140, 197, 64, 0.4)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 dark:border-zinc-800/80">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider">
                                <Clock size={11} className="text-slate-400 dark:text-zinc-500" />
                                {lastUpdate}
                            </span>

                            {/* Permission-Gated Action: Review */}
                            {project.status === 'attention' && (
                                <span
                                    className="px-3.5 py-1.5 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-xl bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/10 transition-all duration-200"
                                    style={{
                                        backgroundColor: '#ef4444'
                                    }}
                                >
                                    Review
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
