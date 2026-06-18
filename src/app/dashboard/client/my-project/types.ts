// ============================================
// Project Dashboard - Shared Types
// ============================================

import type { Document } from "@/lib/schemas/common.schema";

export type ViewState = "LIST" | "LOADING" | "DETAIL";
export type ProjectStatus = "on-track" | "attention" | "new" | "completed";
export type WorkPhase =
  | "LEAD"
  | "DESIGN"
  | "RAB"
  | "CONSTRUCTION"
  | "FINISHING"
  | "HANDOVER";

export interface ProjectManager {
  name: string;
  role: string;
  avatar: string;
  phone: string;
}

export interface Project {
  _id: string; // Backend uses _id
  id?: string; // Optional (frontend convenience)
  name: string; // Backend sends 'name', mapped to 'title' in UI if needed
  title?: string; // UI convenience field (mapped from name)
  location?: {
    address: string;
  };
  status: ProjectStatus; // BE sends string, we might need mapping
  workPhase: WorkPhase;
  progress: number;
  lastUpdate?: string; // Optional in BE
  image?: string; // Optional
  statusLabel?: string;
  description: string;
  startDate?: string;
  targetDate?: string;
  pm?: ProjectManager;
  permissions?: any; // Dynamic permissions from backend
  documents?: Document[]; // Document list from backend
}
