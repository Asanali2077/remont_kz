import { ServiceCategory as UiServiceCategory } from "./data";
export type ServiceCategory = UiServiceCategory;

export type RequestStatus = "new" | "in_progress" | "completed";

export interface CompanyService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  priceFrom: number;
  priceTo: number;
  active: boolean;
  city?: string;
  rating?: number;
  licensed?: boolean;
  availabilityDays?: number;
  urgency?: "low" | "medium" | "high";
  tags?: string[];
  customAttributes?: Record<string, string>;
  images?: string[];
}

export interface ClientRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export type MessageType = "text" | "image" | "audio";

export interface Message {
  id: string;
  requestId?: string;
  clientName: string;
  clientEmail: string;
  content: string;
  type: MessageType;
  imageUrl?: string;
  audioUrl?: string;
  isFromCompany: boolean;
  createdAt: string;
  read: boolean;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  serviceId: string;
  serviceName: string;
  createdAt: string;
}

export type SubscriptionPlan = "free" | "basic" | "premium" | "enterprise";

export interface Subscription {
  plan: SubscriptionPlan;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: "subscription" | "payment" | "refund";
  status: "pending" | "completed" | "failed";
  description: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  createdAt: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
}

export interface AnalyticsData {
  totalServices: number;
  completedRequests: number;
  pendingRequests: number;
  revenue: number;
  requestsByStatus: Array<{ status: RequestStatus; count: number }>;
  requestsByService: Array<{ serviceName: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  requestsByCity: Array<{ city: string; count: number }>;
}

