/**
 * Project Detail Page
 * 
 * Route: /dashboard/client/my-project/[id]
 * Shows detailed information about a specific project
 */

import { auth } from "@/auth";
import { getProjectById } from "@/lib/api/projects";
import { notFound, redirect } from 'next/navigation';
import { ProjectDetailClient } from './ProjectDetailClient';
import type { Project, ProjectManager } from '../types';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

const DEFAULT_PM: ProjectManager = {
    name: 'Project Manager',
    role: 'Project Manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    phone: '628123456789',
};

export default async function ProjectDetailPage({ params }: PageProps) {
    const session = await auth();
    if (!session) redirect("/login");

    const { id } = await params;
    const projectData = await getProjectById(id);

    if (!projectData) {
        notFound();
    }

    // Transform API data to UI Project Type
    const project: Project = {
        _id: projectData._id,
        id: projectData.id || projectData._id,
        name: projectData.name,
        location: projectData.location,
        status: (projectData.status || 'new') as any,
        workPhase: (projectData.workPhase || 'LEAD') as any,
        progress: projectData.progress || 0,
        lastUpdate: projectData.lastUpdate || 'Recently',
        image: projectData.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        statusLabel: projectData.statusLabel || projectData.status,
        description: projectData.description || 'No description available.',
        documents: projectData.documents || [],
        startDate: projectData.startDate || '-',
        targetDate: projectData.targetDate || '-',
        pm: projectData.pm || DEFAULT_PM,
        permissions: projectData.permissions || { canEdit: false }
    };

    return <ProjectDetailClient project={project} />;
}
