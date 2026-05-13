// ============================================
// Project Dashboard - Mock Data
// ============================================

import type { Project, ProjectManager } from "./types";

const defaultPM: ProjectManager = {
  name: "Budi Santoso",
  role: "Project Manager",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
  phone: "6281234567890",
};

export const allProjects: Project[] = [
  {
    _id: "1",
    name: "Renovasi Villa Bali",
    status: "on-track",
    workPhase: "CONSTRUCTION",
    progress: 45,
    lastUpdate: "2 jam lalu",
    image:
      "https://images.unsplash.com/photo-1600596542815-6ad4c727dd2d?auto=format&fit=crop&w=800&q=80",
    statusLabel: "On Track",
    description:
      "Proyek renovasi villa modern dengan konsep tropical minimalist di kawasan Ubud. Meliputi renovasi struktur, interior, dan landscape.",
    startDate: "1 Des 2024",
    targetDate: "1 Mar 2025",
    pm: defaultPM,
  },
  {
    _id: "2",
    name: "Pembangunan Ruko Kemang",
    status: "attention",
    workPhase: "RAB",
    progress: 30,
    lastUpdate: "1 hari lalu",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    statusLabel: "Perlu Review",
    description:
      "Pembangunan ruko 3 lantai dengan desain modern di area komersial Kemang. Terdapat kendala material yang perlu ditinjau.",
    startDate: "15 Nov 2024",
    targetDate: "15 Apr 2025",
    pm: { ...defaultPM, name: "Ahmad Wijaya" },
  },
  {
    _id: "3",
    name: "Interior Cafe Senopati",
    status: "on-track",
    workPhase: "FINISHING",
    progress: 65,
    lastUpdate: "Baru saja",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    statusLabel: "On Track",
    description:
      "Desain interior cafe dengan tema industrial modern untuk brand coffee shop premium.",
    startDate: "1 Nov 2024",
    targetDate: "1 Feb 2025",
    pm: defaultPM,
  },
];
