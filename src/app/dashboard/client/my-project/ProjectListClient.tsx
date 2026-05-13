'use client';

import { useState, useMemo } from 'react';
import type { Project } from './types';
import { ITEMS_PER_PAGE, BRAND } from './constants';
import { Pagination, EmptyState } from '@/components/ui';
import { Toolbar, ProjectCard } from './components';

interface ProjectListClientProps {
    initialProjects: Project[];
}

export default function ProjectListClient({ initialProjects }: ProjectListClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter projects
    const filteredProjects = useMemo(() => {
        let result = initialProjects;

        // Note: Map status from backend to UI filter logic
        if (statusFilter === 'active') {
            result = result.filter(p => p.status !== 'completed'); // Adjust if backend uses different string
        } else if (statusFilter === 'completed') {
            result = result.filter(p => p.status === 'completed');
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.name || '').toLowerCase().includes(query) ||
                (p.location?.address || '').toLowerCase().includes(query)
            );
        }

        return result;
    }, [searchQuery, statusFilter, initialProjects]);

    // Pagination
    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProjects, currentPage]);

    const handleFilterChange = (filter: 'all' | 'active' | 'completed') => {
        setStatusFilter(filter);
        setCurrentPage(1);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Added container for layout structure */}
            <Toolbar
                searchQuery={searchQuery}
                setSearchQuery={handleSearch}
                statusFilter={statusFilter}
                setStatusFilter={handleFilterChange}
                projectCount={filteredProjects.length}
            />

            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    {paginatedProjects.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedProjects.map(project => (
                                    <ProjectCard
                                        key={project._id}
                                        project={project}
                                    />
                                ))}
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={filteredProjects.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                primaryColor={BRAND.primary}
                            />
                        </>
                    ) : (
                        <EmptyState
                            title="No Projects Found"
                            description="Try changing the filter or search keywords"
                        />
                    )}
                    <div className="h-8" />
                </div>
            </div>
        </div>
    );
}
