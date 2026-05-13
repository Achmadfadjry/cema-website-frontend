/**
 * Shared TypeScript type definitions for PT Cipta Maharupa Abadi
 */

// Navigation
export interface NavItem {
  id: string;
  label: string;
  href: string;
}

// User & Authentication
export enum UserRole {
  ADMIN = "admin",
  CLIENT = "client",
  GUEST = "guest",
}

export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
  profilePicture?: string | null;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

// Admin Dashboard Tabs
export interface TabConfig {
  id: string;
  label: string;
  content?: React.ReactNode;
  href?: string;
}

// Services
export type ServiceType = "interior" | "arsitek" | "renovasi";

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  price?: number;
}

// Projects
export type ProjectStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: ProjectStatus;
  serviceType: ServiceType;
  startDate: Date;
  endDate?: Date;
  progress: number; // 0-100
  budget?: number;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Schedule & Appointments
export type ScheduleStatus = "scheduled" | "done" | "cancelled";

export interface Schedule {
  id: string;
  userId: string;
  userName?: string;
  projectId?: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  event: string;
  description?: string;
  status: ScheduleStatus;
  isOnline?: boolean;
  location?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  link?: string;
  createdAt?: Date;
}

// Chat & Messages
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  projectId?: string;
  message: string;
  timestamp: Date;
  isAdmin: boolean;

  read: boolean;
}

export interface ChatConversation {
  id: string;
  participants: User[];
  projectId?: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

// Booking
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  serviceType: ServiceType;
  consultationDate: Date;
  message?: string;
}

export interface Booking extends BookingFormData {
  id: string;
  userId?: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt?: Date;
  confirmedDate?: Date;
}

// Calculator
export type MaterialQuality = "standard" | "premium";

export interface CalculatorInput {
  area: number; // m²
  materialQuality: MaterialQuality;
  serviceType?: ServiceType;
}

export interface CalculatorResult {
  totalCost: number;
  breakdown: {
    basePrice: number;
    materialMultiplier: number;
    finalPrice: number;
  };
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface Portfolio {
  id: string; // Changed from number to string to match backend
  displayName: string; // Was title
  category: string;
  photoUrl: string; // Was imageUrl
  description: string;
  endDate: string; // Was completedDate
  isShown: boolean; // Was showOnHomepage
}

export interface PortfolioRequest {
  id: string;
  displayName: string;
  category: string;
  description: string;
  endDate: string;
  isShown: boolean;
  photoUrl?: File | string; // For upload
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  isActive: boolean;
  showOnHomepage: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isAdmin: boolean;
}

export interface ChatClient {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
  online: boolean;
}
