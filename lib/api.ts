"use client";

import type {
  MessageRecord,
  ProfileRecord,
  RequestOfferRecord,
  RequestRecord,
  RequestStatus,
  ReviewRecord,
  ServiceCategory,
  ServiceRecord,
  UserSummary,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface ApiError {
  error: string;
  details?: unknown;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  user: UserSummary;
  token: string;
  verifyUrl?: string;
  emailVerified?: boolean;
}

export interface CreateRequestPayload {
  serviceId?: string;
  companyId?: string | null;
  description: string;
  category?: ServiceCategory;
  city?: string;
  imageUrl?: string;
  budgetFrom?: number;
  budgetTo?: number;
  deadline?: string;
}

class ApiClient {
  private buildUrl(endpoint: string): string {
    const url = `${API_URL}${endpoint}`;
    return url;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;

    const rawUser = localStorage.getItem("session:user");
    if (!rawUser) {
      return null;
    }

    try {
      const user = JSON.parse(rawUser);
      return user.token || null;
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = this.buildUrl(endpoint);
    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown fetch error";
      throw new Error(`API request failed for ${url}: ${message}`);
    }

    if (response.status === 401) {
      // Auth endpoints legitimately return 401 on bad credentials — don't redirect
      const isAuthEndpoint = endpoint.startsWith("/auth/login") ||
        endpoint.startsWith("/auth/register") ||
        endpoint.startsWith("/auth/forgot-password") ||
        endpoint.startsWith("/auth/reset-password");
      // Only redirect if there was an active session (expired token scenario)
      const hadSession = typeof window !== "undefined" && !!localStorage.getItem("session:user");
      if (!isAuthEndpoint && hadSession) {
        localStorage.removeItem("session:user");
        window.location.href = "/?session_expired=1";
        throw new Error("Session expired. Please log in again.");
      }
      const text = await response.text();
      let message = "Unauthorized";
      try { message = (JSON.parse(text) as { error?: string }).error ?? message; } catch { /* */ }
      throw new Error(message);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error: ${response.status} ${text || response.statusText}`);
    }

    return response.json();
  }

  async register(data: {
    email: string;
    password: string;
    role: "client" | "company";
    name?: string;
    phone?: string;
    recaptchaToken?: string;
  }) {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string, recaptchaToken?: string) {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, recaptchaToken }),
    });
  }

  async getMe() {
    return this.request<UserSummary>("/auth/me");
  }

  async getServices(params?: {
    companyId?: string;
    category?: ServiceCategory;
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
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });
    }

    const services = await this.request<Record<string, unknown>[]>(`/services?${query.toString()}`);
    return services.map(normalizeService);
  }

  async getService(id: string) {
    const service = await this.request<Record<string, unknown>>(`/services/${id}`);
    return normalizeService(service);
  }

  async createService(data: Partial<ServiceRecord>) {
    const service = await this.request<Record<string, unknown>>("/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeService(service);
  }

  async updateService(id: string, data: Partial<ServiceRecord>) {
    const service = await this.request<Record<string, unknown>>(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return normalizeService(service);
  }

  async deleteService(id: string) {
    return this.request<{ message: string }>(`/services/${id}`, {
      method: "DELETE",
    });
  }

  async getCompanyStats(): Promise<{
    totalServices: number;
    totalRequests: number;
    byStatus: { new: number; accepted: number; in_progress: number; completed: number };
    avgRating: number | null;
    revenue: number;
    requestsByDay: { date: string; count: number }[];
  }> {
    return this.request("/company/stats");
  }

  async forgotPassword(email: string): Promise<{ message: string; resetUrl?: string }> {
    return this.request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) });
  }

  async getProfile(): Promise<ProfileRecord> {
    return this.request("/auth/profile");
  }

  async updateProfile(data: { name?: string; phone?: string | null; avatarUrl?: string | null; address?: string | null }): Promise<ProfileRecord> {
    return this.request("/auth/profile", { method: "PUT", body: JSON.stringify(data) });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return this.request("/auth/password", { method: "PUT", body: JSON.stringify(data) });
  }

  async getServiceReviews(serviceId: string): Promise<ReviewRecord[]> {
    return this.request(`/services/${serviceId}/reviews`);
  }

  async getSimilarServices(serviceId: string): Promise<ServiceRecord[]> {
    const services = await this.request<Record<string, unknown>[]>(`/services/${serviceId}/similar`);
    return services.map(normalizeService);
  }

  async replyToReview(requestId: string, companyReply: string): Promise<void> {
    await this.request(`/requests/${requestId}/reply`, { method: "PUT", body: JSON.stringify({ companyReply }) });
  }

  async getChatInbox(): Promise<unknown[]> {
    return this.request("/chat");
  }

  async markMessagesRead(requestId: string): Promise<void> {
    await this.request("/messages/mark-read", { method: "POST", body: JSON.stringify({ requestId }) });
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const url = this.buildUrl("/messages/upload?type=image");
    const response = await fetch(url, { method: "POST", headers, body: formData });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Upload failed: ${text}`);
    }
    const data = await response.json() as { url: string };
    return data;
  }

  async getFavorites(): Promise<ServiceRecord[]> {
    const services = await this.request<Record<string, unknown>[]>("/favorites");
    return services.map(normalizeService);
  }

  async addFavorite(serviceId: string): Promise<void> {
    await this.request("/favorites", { method: "POST", body: JSON.stringify({ serviceId }) });
  }

  async removeFavorite(serviceId: string): Promise<void> {
    await this.request(`/favorites/${serviceId}`, { method: "DELETE" });
  }

  async generateAiSummary(serviceId: string): Promise<{ aiSummary: string }> {
    return this.request("/ai/summary", { method: "POST", body: JSON.stringify({ serviceId }) });
  }

  async deleteAccount(password: string): Promise<{ message: string }> {
    return this.request("/auth/me", { method: "DELETE", body: JSON.stringify({ password }) });
  }

  async getNotificationCount(): Promise<{ unreadMessages: number; newOffers: number; total: number }> {
    return this.request("/notifications/count");
  }

  async sendAiBotMessage(messages: { role: string; content: string }[], collectedData: object): Promise<{ message: string; done?: boolean; data?: CreateRequestPayload }> {
    return this.request("/ai/request-bot", { method: "POST", body: JSON.stringify({ messages, collectedData }) });
  }

  async deleteRequest(id: string) {
    return this.request<{ message: string }>(`/requests/${id}`, {
      method: "DELETE",
    });
  }

  async getRequests(params?: {
    status?: RequestStatus;
    serviceId?: string;
    category?: ServiceCategory;
    city?: string;
    scope?: "assigned" | "unassigned" | "all";
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });
    }

    const requests = await this.request<Record<string, unknown>[]>(`/requests?${query.toString()}`);
    return requests.map(normalizeRequest);
  }

  async getRequest(id: string) {
    const request = await this.request<Record<string, unknown>>(`/requests/${id}`);
    return normalizeRequest(request);
  }

  async createRequest(data: CreateRequestPayload) {
    const request = await this.request<Record<string, unknown>>("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeRequest(request);
  }

  async rateRequest(id: string, rating: number, review?: string) {
    const request = await this.request<Record<string, unknown>>(`/requests/${id}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating, review }),
    });
    return normalizeRequest(request);
  }

  async updateRequest(id: string, data: { status: RequestStatus }) {
    const request = await this.request<Record<string, unknown>>(`/requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return normalizeRequest(request);
  }

  async createOffer(requestId: string, data: { price: number; message?: string }) {
    return this.request<RequestOfferRecord>(`/requests/${requestId}/offer`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteOffer(requestId: string) {
    return this.request<{ message: string }>(`/requests/${requestId}/offer`, {
      method: "DELETE",
    });
  }

  async acceptOffer(requestId: string, companyId: string) {
    const request = await this.request<Record<string, unknown>>(`/requests/${requestId}/accept-offer`, {
      method: "POST",
      body: JSON.stringify({ companyId }),
    });
    return normalizeRequest(request);
  }

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
      messages: MessageRecord[];
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
    return this.request<MessageRecord>("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async uploadMessageFile(file: File, type: "image" | "audio") {
    const formData = new FormData();
    formData.append("file", file);
    const token = this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = this.buildUrl(`/messages/upload?type=${type}`);
    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown fetch error";
      throw new Error(`API request failed for ${url}: ${message}`);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error: ${response.status} ${text || response.statusText}`);
    }

    return response.json() as Promise<{
      url: string;
      type: "image" | "audio";
      size: number;
      mimetype: string;
    }>;
  }
}

function fromDbCategory(value: string): ServiceCategory {
  switch (value) {
    case "AUTOMOBILES":  return "automobiles";
    case "REAL_ESTATE":  return "real-estate";
    case "PLUMBING":     return "plumbing";
    case "ELECTRICAL":   return "electrical";
    case "PAINTING":     return "painting";
    case "CLEANING":     return "cleaning";
    case "RENOVATION":   return "renovation";
    case "WELDING":      return "welding";
    case "ROOFING":      return "roofing";
    default:             return "other";
  }
}

function fromDbStatus(value: string): RequestStatus {
  switch (value) {
    case "ACCEPTED":
      return "accepted";
    case "IN_PROGRESS":
      return "in_progress";
    case "COMPLETED":
      return "completed";
    default:
      return "new";
  }
}

function normalizeService(service: Record<string, unknown>): ServiceRecord {
  const rawService = service as unknown as ServiceRecord & {
    category: string;
    customAttributes?: Record<string, string> | null;
  };

  return {
    ...rawService,
    category: fromDbCategory(rawService.category),
    tags: rawService.tags || [],
    images: rawService.images || [],
    customAttributes: rawService.customAttributes || null,
    address: rawService.address ?? null,
    lat: rawService.lat ?? null,
    lng: rawService.lng ?? null,
    aiSummary: rawService.aiSummary ?? null,
    aiSummaryAt: rawService.aiSummaryAt ?? null,
    startDate: rawService.startDate ?? null,
    endDate: rawService.endDate ?? null,
  };
}

function normalizeRequest(request: Record<string, unknown>): RequestRecord {
  const rawRequest = request as unknown as RequestRecord & {
    status: string;
    category?: string | null;
    service?: {
      id: string;
      name: string;
      category: string;
      city?: string | null;
    } | null;
  };

  return {
    ...rawRequest,
    status: fromDbStatus(rawRequest.status),
    category: rawRequest.category ? fromDbCategory(rawRequest.category) : null,
    service: rawRequest.service
      ? {
          ...rawRequest.service,
          category: fromDbCategory(rawRequest.service.category),
        }
      : null,
    offers: rawRequest.offers ?? [],
  };
}

export const api = new ApiClient();
