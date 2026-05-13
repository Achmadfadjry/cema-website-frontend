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
        <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-5xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Breadcrumb Back Link */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#8CC540] transition-colors mb-6 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Kembali ke Daftar Proyek</span>
                </button>

                {/* Header - Title + Badge inline */}
                <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{project.name}</h1>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${statusConfig.bg} ${statusConfig.textClass} text-sm font-medium rounded-full`}>
                        {statusConfig.icon}
                        <span>{project.statusLabel}</span>
                    </div>
                </div>

                {/* Location + Work Phase */}
                <div className="flex items-center gap-3 text-slate-500 mb-6">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        <span>{project.location?.address || 'Unknown Location'}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md text-white"
                        style={{ backgroundColor: workPhaseConfig.color }}
                    >
                        Tahap: {workPhaseConfig.label}
                    </span>
                </div>

                {/* Hero Image */}
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-lg">
                    <Image
                        src={project.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                        alt={project.name}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-green-50 text-[#8CC540]'
                                    : 'text-slate-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'overview' && (
                            <>
                                {/* Description Card */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="font-semibold text-slate-800 mb-3">Deskripsi Proyek</h3>
                                    <p className="text-slate-600 leading-relaxed">{project.description}</p>
                                </div>

                                {/* Progress Card */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="font-semibold text-slate-800 mb-4">Progress Pekerjaan</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Keseluruhan</span>
                                            <span className="font-semibold text-slate-800">{project.progress}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${project.progress}%`, backgroundColor: BRAND.primary }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'files' && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <h3 className="font-semibold text-slate-800 mb-4">Dokumen Proyek</h3>
                                {project.documents && project.documents.length > 0 ? (
                                    <div className="space-y-3">
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
                                                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                                >
                                                    <FileText size={20} style={{ color: BRAND.primary }} className="flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-slate-800 font-medium truncate group-hover:text-[#8CC540] transition-colors">
                                                            {doc.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span
                                                                className="text-xs font-medium px-2 py-0.5 rounded text-white"
                                                                style={{ backgroundColor: typeConfig.color }}
                                                            >
                                                                {typeConfig.label}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                • {uploadDate}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-slate-500 text-sm">
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
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Calendar size={16} style={{ color: BRAND.primary }} />
                                Timeline
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Mulai</span>
                                    <span className="font-medium text-slate-800">{project.startDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Target Selesai</span>
                                    <span className="font-medium text-slate-800">{project.targetDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Manager Card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <h3 className="font-semibold text-slate-800 mb-4">Project Manager</h3>

                            {/* PM Profile */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100">
                                    <Image
                                        src={project.pm?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                                        alt={project.pm?.name || 'Project Manager'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">{project.pm?.name || 'Unassigned'}</p>
                                    <p className="text-sm text-slate-500">{project.pm?.role || 'Project Manager'}</p>
                                </div>
                            </div>

                            {/* WhatsApp Button */}
                            <button
                                onClick={handleWhatsApp}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-xl transition-all hover:shadow-md"
                                style={{ backgroundColor: BRAND.primary }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND.primaryHover}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = BRAND.primary}
                            >
                                <MessageCircle size={18} />
                                Chat via WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
