"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { ServicesManagement } from "@/components/company/ServicesManagement";
import { RequestsManagement } from "@/components/company/RequestsManagement";
import { MessagesManagement } from "@/components/company/MessagesManagement";
import { ReviewsManagement } from "@/components/company/ReviewsManagement";
import { AnalyticsDashboard } from "@/components/company/AnalyticsDashboard";
import { PersonalAccount } from "@/components/company/PersonalAccount";
import { useLang } from "@/components/nav/LangSwitcher";
import { t } from "@/lib/translations";

export default function CompanyDashboardPage() {
  const { lang } = useLang();
  const tr = t(lang);

  return (
    <ProtectedRoute requiredRole="company">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {lang === "kaz" ? "Басқару панелі" : "Панель управления"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "kaz"
                ? "Қызметтерді, өтініштерді және хабарламаларды басқару"
                : "Управление услугами, заявками и сообщениями"}
            </p>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="services">{tr.nav.services}</TabsTrigger>
              <TabsTrigger value="requests">{tr.nav.requests}</TabsTrigger>
              <TabsTrigger value="messages">{tr.nav.messages}</TabsTrigger>
              <TabsTrigger value="reviews">{tr.nav.reviews}</TabsTrigger>
              <TabsTrigger value="analytics">{tr.nav.analytics}</TabsTrigger>
              <TabsTrigger value="account">{tr.nav.account}</TabsTrigger>
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

            <TabsContent value="reviews" className="mt-6">
              <ReviewsManagement />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="account" className="mt-6">
              <PersonalAccount />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
