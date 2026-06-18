"use client";

import { ReactNode } from "react";
import {
  Users,
  Building2,
  CheckCircle2,
  Leaf,
  Sofa,
  FileText,
} from "lucide-react";

// Service icon mapping
export const getServiceIcon = (category: string): ReactNode => {
  switch (category?.toLowerCase()) {
    case 'design': return <Users size={24} />;
    case 'planning': return <Building2 size={24} />;
    case 'build': return <CheckCircle2 size={24} />;
    case 'outdoor': return <Leaf size={24} />;
    case 'craft': return <Sofa size={24} />;
    default: return <FileText size={24} />;
  }
};

// Time slots
export const TIME_SLOTS = [
  "09:00", "10:00", "13:00", "14:00", "16:00"
];

// Format date helper
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

// Get minimum date (H+3)
export const getMinDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().split("T")[0];
};
