"use client";

import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { RequestsManagement } from "@/components/company/RequestsManagement";
import { ServicesManagement } from "@/components/company/ServicesManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CompanyDashboardPage() {
  return (
    <ProtectedRoute requiredRole="company">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Company dashboard</h1>
            <p className="text-muted-foreground">
              Manage your services and process client requests end to end.
            </p>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6">
              <ServicesManagement />
            </TabsContent>

            <TabsContent value="requests" className="mt-6">
              <RequestsManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
