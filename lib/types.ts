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
