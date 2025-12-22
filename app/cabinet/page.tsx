"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CabinetPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Кабинет</h1>
      </div>
      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">Мои объявления</TabsTrigger>
          <TabsTrigger value="billing">Счет и платежи</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="mt-4">
          <p className="text-sm text-muted-foreground">Здесь будут ваши объявления.</p>
        </TabsContent>
        <TabsContent value="billing" className="mt-4">
          <p className="text-sm text-muted-foreground">История платежей и пополнение счета.</p>
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <p className="text-sm text-muted-foreground">Настройки профиля и уведомлений.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}


