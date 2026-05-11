export type UserRole = "client" | "company" | "admin";

export type ServiceCategory =
  | "automobiles"
  | "real-estate"
  | "plumbing"
  | "electrical"
  | "painting"
  | "cleaning"
  | "renovation"
  | "welding"
  | "roofing"
  | "other";

export type OfferStatus = "pending" | "accepted" | "rejected";

export type RequestStatus = "new" | "accepted" | "in_progress" | "completed";

export type MessageType = "text" | "image" | "audio";

export const SERVICE_CATEGORY_OPTIONS: ServiceCategory[] = [
  "automobiles",
  "real-estate",
  "plumbing",
  "electrical",
  "painting",
  "cleaning",
  "renovation",
  "welding",
  "roofing",
  "other",
];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  automobiles: "Automobiles",
  "real-estate": "Real Estate",
  plumbing: "Plumbing",
  electrical: "Electrical",
  painting: "Painting",
  cleaning: "Cleaning",
  renovation: "Renovation",
  welding: "Welding",
  roofing: "Roofing",
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
  avatarUrl?: string | null;
  isVerified?: boolean | null;
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
  tags: string[];
  customAttributes?: Record<string, string> | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  aiSummary?: string | null;
  aiSummaryAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
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
  address?: string;
  imageUrls?: string[];
  tags?: string[];
  startDate?: string;
  endDate?: string;
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
  status: OfferStatus;
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
  review?: string | null;
  companyReply?: string | null;
  budgetFrom?: number | null;
  budgetTo?: number | null;
  expiresAt?: string | null;
  deadline?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: UserSummary;
  service?: RequestServiceSummary | null;
  company?: UserSummary | null;
  offers?: RequestOfferRecord[];
}

export interface ProfileRecord {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  address: string | null;
  role: string;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  rating: number;
  review?: string | null;
  companyReply?: string | null;
  createdAt: string;
  client?: { name?: string | null; email: string } | null;
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
