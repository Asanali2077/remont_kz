"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { ServicesManagement } from "@/components/company/ServicesManagement";
import { RequestsManagement } from "@/components/company/RequestsManagement";
import { MessagesManagement } from "@/components/company/MessagesManagement";

export default function CompanyDashboardPage() {
  return (
    <ProtectedRoute requiredRole="company">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Панель управления</h1>
            <p className="text-muted-foreground">
              Управляйте услугами, заявками и сообщениями
            </p>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services">Услуги</TabsTrigger>
              <TabsTrigger value="requests">Заявки</TabsTrigger>
              <TabsTrigger value="messages">Сообщения</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6">
              <ServicesManagement />
            </TabsContent>

            <TabsContent value="requests" className="mt-6">
              <RequestsManagement />
            </TabsContent>

            <TabsContent value="messages" className="mt-6">
              <MessagesManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
