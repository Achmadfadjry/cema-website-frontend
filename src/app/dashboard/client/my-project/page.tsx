import { auth } from "@/auth";
import { getMyProjects } from "@/lib/api/projects";
import { redirect } from "next/navigation";
import ProjectListClient from "./ProjectListClient";
import type { Project } from "./types";

export default async function ProjectListPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch Real Data Server-Side
  // We explicitly cast the API response to the UI Project type
  // In a production app, we would use a mapper function to transform API -> UI Model
  const projectsData = await getMyProjects();
  
  // Transform API data to UI Project Type 
  // (Ensurs compatibility with ProjectListClient)
  const projects: Project[] = projectsData.map(p => ({
    _id: p._id,
    id: p.id || p._id,
    name: p.name,
    location: p.location,
    status: (p.status || 'new') as any, // Cast to ProjectStatus union
    workPhase: (p.workPhase || 'LEAD') as any, // Cast to WorkPhase union
    progress: p.progress || 0,
    lastUpdate: p.lastUpdate || 'Unknown',
    image: p.image || '',
    statusLabel: p.statusLabel,
    description: p.description || '',
    startDate: p.startDate,
    targetDate: p.targetDate,
    pm: p.pm,
    permissions: p.permissions || {}
  }));


  return <ProjectListClient initialProjects={projects} />;
}
