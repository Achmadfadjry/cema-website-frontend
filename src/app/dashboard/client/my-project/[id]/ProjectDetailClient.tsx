'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    MapPin,
    ArrowLeft,
    FileText,
    Calendar,
    MessageCircle,
    LayoutGrid
} from 'lucide-react';
import type { Project } from '../types';
import { BRAND, WORK_PHASE_LABELS, getStatusConfig } from '../constants';

interface ProjectDetailClientProps {
    project: Project;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'files'>('overview');

    // Safety Fallbacks
    const statusConfig = getStatusConfig(project.status) || getStatusConfig('new');
    const workPhaseConfig = WORK_PHASE_LABELS[project.workPhase] || WORK_PHASE_LABELS['LEAD'];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutGrid size={16} /> },
        { id: 'files', label: 'Files', icon: <FileText size={16} /> },
    ] as const;

    const handleWhatsApp = () => {
        const message = encodeURIComponent(`Halo ${project.pm?.name}, saya ingin bertanya tentang proyek "${project.name}".`);
        window.open(`https://wa.me/${project.pm?.phone}?text=${message}`, '_blank');
    };

    const handleBack = () => {
        router.push('/dashboard/client/my-project');
    };

    return (
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-transparent">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Breadcrumb Back Link */}
                <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-[#8CC540] bg-white dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-800 px-3.5 py-2 rounded-xl transition-all duration-300 mb-8 group text-[10px] font-black uppercase tracking-widest hover:shadow shadow-sm cursor-pointer active:scale-95"
                >
                    <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Kembali ke Daftar Proyek</span>
                </button>

                {/* Header - Title + Badge inline */}
                <div className="flex flex-wrap items-center gap-4 mb-2">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">{project.name}</h1>
                    <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 shadow-sm ${statusConfig.textClass} text-xs font-extrabold uppercase tracking-wider rounded-full`}>
                        {statusConfig.icon}
                        <span>{project.statusLabel}</span>
                    </div>
                </div>

                {/* Location + Work Phase */}
                <div className="flex items-center gap-3 text-slate-400 dark:text-zinc-400 text-xs md:text-sm font-semibold mb-8">
                    <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400 dark:text-zinc-500" />
                        <span>{project.location?.address || 'Unknown Location'}</span>
                    </div>
                    <span className="text-slate-200 dark:text-zinc-800">•</span>
                    <span
                        className="inline-flex items-center px-3 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xl"
                        style={{ 
                            backgroundColor: `${workPhaseConfig.color}08`, 
                            color: workPhaseConfig.color, 
                            border: `1px solid ${workPhaseConfig.color}20` 
                        }}
                    >
                        Tahap: {workPhaseConfig.label}
                    </span>
                </div>

                {/* Hero Image */}
                <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-10 shadow-md border border-slate-200/30 dark:border-zinc-800/30">
                    <Image
                        src={project.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                        alt={project.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-955/20 to-transparent pointer-events-none" />
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-200/30 dark:bg-zinc-950 border border-slate-200/20 dark:border-zinc-800 rounded-2xl p-1 mb-8 max-w-xs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-300 cursor-pointer ${activeTab === tab.id
                                    ? 'bg-[#8CC540] text-white shadow shadow-lime-500/25'
                                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-white/20 dark:hover:bg-zinc-900/20'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'overview' && (
                            <>
                                {/* Description Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-150 dark:border-zinc-800 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-300">
                                    <h3 className="font-extrabold text-slate-400 dark:text-zinc-500 text-xs mb-4 uppercase tracking-widest">Deskripsi Proyek</h3>
                                    <p className="text-slate-655 dark:text-zinc-300 leading-relaxed text-sm md:text-base font-medium">{project.description}</p>
                                </div>

                                {/* Progress Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-150 dark:border-zinc-800 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-300">
                                    <h3 className="font-extrabold text-slate-400 dark:text-zinc-500 text-xs mb-4.5 uppercase tracking-widest">Progress Pekerjaan</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs md:text-sm font-extrabold tracking-wider">
                                            <span className="text-slate-400 dark:text-zinc-500 uppercase">KESELURUHAN</span>
                                            <span className="text-[#8CC540] text-lg font-black">{project.progress}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-100/60 dark:bg-zinc-950/60 border border-slate-200/20 dark:border-zinc-800/80 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#8CC540] to-[#76a536]"
                                                style={{ 
                                                    width: `${project.progress}%`,
                                                    boxShadow: '0 0 10px rgba(140, 197, 64, 0.3)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'files' && (
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-150 dark:border-zinc-800 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-300">
                                <h3 className="font-extrabold text-slate-400 dark:text-zinc-500 text-xs mb-5 uppercase tracking-widest">Dokumen Proyek</h3>
                                {project.documents && project.documents.length > 0 ? (
                                    <div className="space-y-3.5">
                                        {project.documents.map((doc, i) => {
                                            // Format the uploaded date
                                            const uploadDate = new Date(doc.uploaded_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            });

                                            // Get document type label with color
                                            const typeConfig = {
                                                CONTRACT: { label: 'Kontrak', color: '#3b82f6' },
                                                BLUEPRINT: { label: 'Blueprint', color: '#8b5cf6' },
                                                INVOICE: { label: 'Invoice', color: '#10b981' }
                                            }[doc.type] || { label: doc.type, color: '#6b7280' };

                                            return (
                                                <a
                                                    key={i}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-zinc-950/50 hover:bg-white dark:hover:bg-zinc-950 border border-slate-150 dark:border-zinc-800 hover:border-[#8CC540]/30 rounded-2xl transition-all duration-300 group hover:shadow-md hover:shadow-lime-500/3 hover:-translate-y-0.5"
                                                >
                                                    <div className="w-11 h-11 rounded-xl bg-[#8CC540]/8 dark:bg-[#8CC540]/12 flex items-center justify-center shrink-0 transition-all group-hover:bg-[#8CC540]/15 group-hover:scale-105 shadow-inner">
                                                        <FileText size={18} style={{ color: BRAND.primary }} />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-slate-800 dark:text-zinc-200 font-extrabold text-sm md:text-base truncate group-hover:text-[#8CC540] transition-colors leading-tight tracking-tight">
                                                            {doc.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span
                                                                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border"
                                                                style={{ 
                                                                    backgroundColor: `${typeConfig.color}08`, 
                                                                    borderColor: `${typeConfig.color}15`,
                                                                    color: typeConfig.color 
                                                                }}
                                                            >
                                                                {typeConfig.label}
                                                            </span>
                                                            <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                                                                • {uploadDate}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/40 dark:bg-zinc-950/40">
                                        <FileText size={40} className="mx-auto text-slate-300 dark:text-zinc-700 mb-3" />
                                        <p className="text-slate-400 dark:text-zinc-500 text-xs md:text-sm font-semibold">
                                            Belum ada dokumen yang diunggah untuk proyek ini
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Timeline Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-150 dark:border-zinc-800 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                            <h3 className="font-extrabold text-slate-400 dark:text-zinc-500 text-xs mb-5 flex items-center gap-2 uppercase tracking-widest">
                                <Calendar size={15} style={{ color: BRAND.primary }} />
                                Timeline
                            </h3>
                            
                            <div className="relative pl-5 border-l-2 border-slate-100 dark:border-zinc-800 space-y-6 text-xs md:text-sm">
                                {/* Start node */}
                                <div className="relative">
                                    <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-[#8CC540] border-2 border-white dark:border-zinc-900 ring-4 ring-lime-150 dark:ring-lime-950/50" />
                                    <span className="block text-[10px] font-extrabold text-slate-450 dark:text-zinc-500 uppercase leading-none mb-1 tracking-wider">Mulai</span>
                                    <span className="font-black text-slate-700 dark:text-zinc-300">{project.startDate}</span>
                                </div>
                                {/* Target node */}
                                <div className="relative">
                                    <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-slate-350 dark:bg-zinc-650 border-2 border-white dark:border-zinc-900" />
                                    <span className="block text-[10px] font-extrabold text-slate-450 dark:text-zinc-500 uppercase leading-none mb-1 tracking-wider">Target Selesai</span>
                                    <span className="font-black text-slate-700 dark:text-zinc-300">{project.targetDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Manager Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-150 dark:border-zinc-800 shadow-sm p-6 hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
                            {/* Blur highlight background decoration */}
                            <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#8CC540]/6 rounded-full blur-xl pointer-events-none" />

                            <h3 className="font-extrabold text-slate-400 dark:text-zinc-500 text-xs mb-5 uppercase tracking-widest relative z-10">Project Manager</h3>

                            {/* PM Profile */}
                            <div className="flex items-center gap-3.5 mb-6 relative z-10">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#8CC540]/30 dark:border-[#8CC540]/45 shadow-md">
                                    <Image
                                        src={project.pm?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                                        alt={project.pm?.name || 'Project Manager'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 dark:text-zinc-200 text-sm leading-tight">{project.pm?.name || 'Unassigned'}</p>
                                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-extrabold mt-0.5 uppercase tracking-wider">{project.pm?.role || 'Project Manager'}</p>
                                </div>
                            </div>

                            {/* WhatsApp Button */}
                            <button
                                onClick={handleWhatsApp}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white text-xs md:text-sm font-extrabold rounded-xl transition-all duration-300 bg-gradient-to-r from-[#8CC540] to-[#76a536] hover:from-[#76a536] hover:to-[#5b8e34] shadow-md shadow-lime-500/10 hover:shadow-lime-500/20 active:scale-95 cursor-pointer"
                            >
                                <MessageCircle size={15} />
                                Chat via WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
