export type UserRole = "client" | "company";

export type ServiceCategory = "automobiles" | "real-estate" | "other";

export type RequestStatus = "new" | "accepted" | "in_progress" | "completed";

export type MessageType = "text" | "image" | "audio";

export const SERVICE_CATEGORY_OPTIONS: ServiceCategory[] = [
  "automobiles",
  "real-estate",
  "other",
];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  automobiles: "Automobiles",
  "real-estate": "Real Estate",
  other: "Other",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: "New",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
};

export interface UserSummary {
  id: string;
  email: string;
  role: string;
  name?: string | null;
  phone?: string | null;
}

export interface ServiceImageRecord {
  id: string;
  url: string;
  order: number;
}

export interface ServiceRecord {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  priceFrom: number;
  priceTo: number;
  active: boolean;
  city?: string | null;
  rating?: number | null;
  licensed?: boolean;
  availabilityDays?: number | null;
  urgency?: "low" | "medium" | "high" | null;
  tags: string[];
  customAttributes?: Record<string, string> | null;
  companyId: string;
  company: UserSummary;
  images: ServiceImageRecord[];
  _count?: {
    requests: number;
  };
}

export interface ServiceFormValues {
  id?: string;
  name: string;
  category: ServiceCategory;
  description: string;
  priceFrom: number;
  priceTo: number;
  city?: string;
  imageUrl?: string;
  availabilityDays?: number;
  urgency?: "low" | "medium" | "high";
}

export interface RequestServiceSummary {
  id: string;
  name: string;
  category: ServiceCategory;
  city?: string | null;
}

export interface RequestOfferRecord {
  id: string;
  requestId: string;
  companyId: string;
  price: number;
  message?: string | null;
  createdAt: string;
  company?: UserSummary;
}

export interface RequestRecord {
  id: string;
  clientId: string;
  serviceId?: string | null;
  companyId?: string | null;
  description: string;
  category?: ServiceCategory | null;
  city?: string | null;
  imageUrl?: string | null;
  status: RequestStatus;
  rating?: number | null;
  budgetFrom?: number | null;
  budgetTo?: number | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: UserSummary;
  service?: RequestServiceSummary | null;
  company?: UserSummary | null;
  offers?: RequestOfferRecord[];
}

export interface MessageRecord {
  id: string;
  requestId?: string | null;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  imageUrl?: string | null;
  audioUrl?: string | null;
  read: boolean;
  createdAt: string;
  sender?: UserSummary;
  receiver?: UserSummary;
}
