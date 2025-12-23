"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction } from "@/lib/types";
import { CheckCircle2, Crown, Zap, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLang } from "@/components/nav/LangSwitcher";
import { t } from "@/lib/translations";

type SubscriptionPeriod = "monthly" | "quarterly" | "semiannual" | "yearly";

interface SubscriptionPlan {
  id: string;
  name: string;
  nameKaz: string;
  price: number;
  period: SubscriptionPeriod;
  periodLabel: string;
  periodLabelKaz: string;
  features: string[];
  featuresKaz: string[];
  icon: React.ComponentType<{ className?: string }>;
  popular?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Бесплатный",
    nameKaz: "Тегін",
    price: 0,
    period: "monthly",
    periodLabel: "Бесплатно",
    periodLabelKaz: "Тегін",
    features: ["До 5 услуг", "Базовые функции", "Ограниченная аналитика"],
    featuresKaz: ["5 қызметке дейін", "Негізгі функциялар", "Шектеулі аналитика"],
    icon: Building2,
  },
  {
    id: "basic",
    name: "Basic",
    nameKaz: "Basic",
    price: 5000,
    period: "monthly",
    periodLabel: "в месяц",
    periodLabelKaz: "айына",
    features: ["До 20 услуг", "Полная аналитика", "Приоритетная поддержка", "Расширенные фильтры"],
    featuresKaz: ["20 қызметке дейін", "Толық аналитика", "Басымдықтық қолдау", "Кеңейтілген сүзгілер"],
    icon: Zap,
  },
  {
    id: "premium",
    name: "Premium",
    nameKaz: "Premium",
    price: 12000,
    period: "monthly",
    periodLabel: "в месяц",
    periodLabelKaz: "айына",
    features: ["Неограниченное количество услуг", "Продвинутая аналитика", "24/7 поддержка", "Все фильтры", "API доступ"],
    featuresKaz: ["Шексіз қызметтер", "Жетілдірілген аналитика", "24/7 қолдау", "Барлық сүзгілер", "API қолжетімділігі"],
    icon: Crown,
    popular: true,
  },
];

const periodOptions = [
  { value: "monthly", label: "Месяц", labelKaz: "Ай", months: 1 },
  { value: "quarterly", label: "3 месяца", labelKaz: "3 ай", months: 3 },
  { value: "semiannual", label: "6 месяцев", labelKaz: "6 ай", months: 6 },
  { value: "yearly", label: "Год", labelKaz: "Жыл", months: 12 },
];

export function PersonalAccount() {
  const { lang } = useLang();
  const tr = t(lang);
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
  } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>("monthly");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subData, transData] = await Promise.all([
        api.getSubscription(),
        api.getTransactions(),
      ]);
      setSubscription(subData);
      const normalized = (transData.transactions || []).map((tx) => ({
        ...tx,
        type: tx.type.toLowerCase() as Transaction["type"],
        status: tx.status.toLowerCase() as Transaction["status"],
      }));
      setTransactions(normalized);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка загрузки данных";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      await api.createSubscription({
        plan: planId,
        autoRenew: true,
      });
      toast.success("Подписка успешно оформлена");
      loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка оформления подписки";
      toast.error(message);
    }
  };

  const calculatePrice = (basePrice: number, period: SubscriptionPeriod) => {
    const periodOption = periodOptions.find((p) => p.value === period);
    if (!periodOption) return basePrice;
    // Discount for longer periods
    const discount = period === "yearly" ? 0.2 : period === "semiannual" ? 0.15 : period === "quarterly" ? 0.1 : 0;
    return Math.round(basePrice * periodOption.months * (1 - discount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === "kaz" ? "kk-KZ" : "ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; labelKaz: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Активна", labelKaz: "Белсенді", variant: "default" },
      expired: { label: "Истекла", labelKaz: "Мерзімі өтті", variant: "destructive" },
      cancelled: { label: "Отменена", labelKaz: "Болдырылды", variant: "outline" },
      completed: { label: "Завершена", labelKaz: "Аяқталды", variant: "default" },
      pending: { label: "Ожидает", labelKaz: "Күтуде", variant: "secondary" },
      failed: { label: "Ошибка", labelKaz: "Қате", variant: "destructive" },
    };
    const config = variants[status] || { label: status, labelKaz: status, variant: "outline" };
    return <Badge variant={config.variant}>{lang === "kaz" ? config.labelKaz : config.label}</Badge>;
  };

  const currentPlan = subscription
    ? plans.find((p) => p.id === subscription.plan?.toLowerCase())
    : plans[0];

  if (loading) {
    return <div className="text-center py-12">{tr.common.loading}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{tr.account.title}</h2>
      </div>

      <Tabs defaultValue="subscription" className="w-full">
        <TabsList>
          <TabsTrigger value="subscription">{tr.account.subscription}</TabsTrigger>
          <TabsTrigger value="transactions">{tr.account.transactions}</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-4">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{tr.account.currentPlan}</CardTitle>
                  <CardDescription>
                    {currentPlan ? (lang === "kaz" ? currentPlan.nameKaz : currentPlan.name) : ""} -{" "}
                    {subscription?.status === "ACTIVE" ? (lang === "kaz" ? "Белсенді" : "Активна") : (lang === "kaz" ? "Белсенді емес" : "Неактивна")}
                  </CardDescription>
                </div>
                {subscription && getStatusBadge(subscription.status?.toLowerCase() || "active")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{lang === "kaz" ? "Жазылым басталуы" : "Начало подписки"}</p>
                      <p className="font-medium">{formatDate(subscription.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{lang === "kaz" ? "Жазылым аяқталуы" : "Окончание подписки"}</p>
                      <p className="font-medium">{formatDate(subscription.endDate)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle>{lang === "kaz" ? "Кезеңді таңдау" : "Выбор периода"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPeriod} onValueChange={(value: SubscriptionPeriod) => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {lang === "kaz" ? option.labelKaz : option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{lang === "kaz" ? "Қолжетімді жоспарлар" : "Доступные планы"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = subscription?.plan?.toLowerCase() === plan.id;
                const price = calculatePrice(plan.price, selectedPeriod);
                const periodLabel = periodOptions.find((p) => p.value === selectedPeriod);

                return (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.popular ? "ring-2 ring-primary" : ""} ${
                      isCurrentPlan ? "bg-muted" : ""
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 right-2">{lang === "kaz" ? "Танымал" : "Популярный"}</Badge>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-lg">{lang === "kaz" ? plan.nameKaz : plan.name}</CardTitle>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{price.toLocaleString()}</span>
                        <span className="text-muted-foreground">₸</span>
                        {plan.price > 0 && periodLabel && (
                          <span className="text-sm text-muted-foreground">
                            /{lang === "kaz" ? periodLabel.labelKaz : periodLabel.label}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {(lang === "kaz" ? plan.featuresKaz : plan.features).map((feature, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={isCurrentPlan ? "outline" : "default"}
                        disabled={isCurrentPlan}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {isCurrentPlan
                          ? (lang === "kaz" ? "Ағымдағы жоспар" : "Текущий план")
                          : (lang === "kaz" ? "Жоспарды таңдау" : "Выбрать план")}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tr.account.transactions}</CardTitle>
              <CardDescription>{lang === "kaz" ? "Барлық төлемдер мен транзакциялар" : "Все ваши платежи и транзакции"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {lang === "kaz" ? "Транзакциялар жоқ" : "Нет транзакций"}
                  </p>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{transaction.description}</p>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {transaction.amount.toLocaleString()} {transaction.currency}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{transaction.type}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
