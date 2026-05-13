"use client";

import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
