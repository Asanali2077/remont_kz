import { AnalyticsData } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface ApiError {
  error: string;
  details?: unknown;
}

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  priceFrom: number;
  priceTo: number;
  active: boolean;
  city?: string;
  rating?: number;
  licensed?: boolean;
  availabilityDays?: number;
  urgency?: string;
  tags?: string[];
  customAttributes?: Record<string, string>;
  images?: Array<{ url: string }>;
}

interface Request {
  id: string;
  clientId: string;
  serviceId: string;
  companyId: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client?: User;
  service?: { id: string; name: string; category: string };
  company?: User;
}

interface Message {
  id: string;
  requestId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  imageUrl?: string;
  audioUrl?: string;
  read: boolean;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("session:user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.token || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: "Network error",
      }));
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  }

  // Auth
  async register(data: {
    email: string;
    password: string;
    role: "client" | "company";
    name?: string;
    phone?: string;
  }) {
    return this.request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<User>("/auth/me");
  }

  // Services
  async getServices(params?: {
    companyId?: string;
    category?: string;
    city?: string;
    active?: boolean;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    licensed?: boolean;
    tags?: string;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
    }
    return this.request<Service[]>(`/services?${query.toString()}`);
  }

  async getService(id: string) {
    return this.request<Service>(`/services/${id}`);
  }

  async createService(data: Partial<Service>) {
    return this.request<Service>("/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: Partial<Service>) {
    return this.request<Service>(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string) {
    return this.request<{ message: string }>(`/services/${id}`, {
      method: "DELETE",
    });
  }

  async uploadServiceImage(serviceId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const token = this.getToken();
    const response = await fetch(`${API_URL}/services/${serviceId}/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }
    return response.json();
  }

  async deleteServiceImage(serviceId: string, imageId: string) {
    return this.request<{ message: string }>(
      `/services/${serviceId}/images/${imageId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Requests
  async getRequests(params?: { status?: string; serviceId?: string }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, String(value));
      });
    }
    return this.request<Request[]>(`/requests?${query.toString()}`);
  }

  async getRequest(id: string) {
    return this.request<Request>(`/requests/${id}`);
  }

  async createRequest(data: { serviceId: string; message: string }) {
    return this.request<Request>("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRequest(id: string, data: { status?: string }) {
    return this.request<Request>(`/requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Messages
  async getMessages(params?: {
    requestId?: string;
    receiverId?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
    }
    return this.request<{
      messages: Message[];
      pagination: Pagination;
    }>(`/messages?${query.toString()}`);
  }

  async sendMessage(data: {
    requestId?: string;
    receiverId: string;
    content: string;
    type?: "text" | "image" | "audio";
    imageUrl?: string;
    audioUrl?: string;
  }) {
    return this.request<Message>("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async uploadMessageFile(file: File, type: "image" | "audio") {
    const formData = new FormData();
    formData.append("file", file);
    const token = this.getToken();
    const response = await fetch(`${API_URL}/messages/upload?type=${type}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }
    return response.json();
  }

  // Analytics
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    city?: string;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, String(value));
      });
    }
    return this.request<AnalyticsData>(`/analytics?${query.toString()}`);
  }

  // Subscriptions
  async getSubscription() {
    return this.request<{
      plan: string;
      status: string;
      startDate: string;
      endDate: string;
      autoRenew: boolean;
    }>("/payments/subscription");
  }

  async createSubscription(data: { plan: string; autoRenew?: boolean }) {
    return this.request<{
      plan: string;
      status: string;
      startDate: string;
      endDate: string;
      autoRenew: boolean;
    }>("/payments/subscription", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTransactions(params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
    }
    return this.request<{
      transactions: Transaction[];
      pagination: Pagination;
    }>(`/payments/transactions?${query.toString()}`);
  }
}

export const api = new ApiClient();

