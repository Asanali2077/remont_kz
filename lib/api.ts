"use client";

import type {
  MessageRecord,
  RequestRecord,
  RequestStatus,
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
}

export interface CreateRequestPayload {
  serviceId?: string;
  companyId?: string | null;
  description: string;
  category?: ServiceCategory;
  city?: string;
  imageUrl?: string;
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
  }) {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
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

  async updateCompanyProfile(data: { name?: string; phone?: string }) {
    return this.request<{ id: string; email: string; name: string | null; phone: string | null; role: string }>(
      "/company/profile",
      { method: "PUT", body: JSON.stringify(data) }
    );
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

  async updateRequest(id: string, data: { status: RequestStatus }) {
    const request = await this.request<Record<string, unknown>>(`/requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
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
    case "AUTOMOBILES":
      return "automobiles";
    case "REAL_ESTATE":
      return "real-estate";
    default:
      return "other";
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
    urgency?: string | null;
    customAttributes?: Record<string, string> | null;
  };

  return {
    ...rawService,
    category: fromDbCategory(rawService.category),
    urgency: rawService.urgency?.toLowerCase() as "low" | "medium" | "high" | null | undefined,
    tags: rawService.tags || [],
    images: rawService.images || [],
    customAttributes: rawService.customAttributes || null,
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
  };
}

export const api = new ApiClient();
