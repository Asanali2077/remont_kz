"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AnalyticsData, ServiceCategory } from "@/lib/types";
import { CITIES } from "@/lib/data";
import { TrendingUp, DollarSign, CheckCircle2, Clock, Package } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLang } from "@/components/nav/LangSwitcher";
import { t } from "@/lib/translations";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function AnalyticsDashboard() {
  const { lang } = useLang();
  const tr = t(lang);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState<ServiceCategory | "all">("all");
  const [cityFilter, setCityFilter] = useState("all");
  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, serviceFilter, cityFilter]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (dateFilter !== "all") {
        const now = new Date();
        const startDate = new Date();
        switch (dateFilter) {
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "quarter":
            startDate.setMonth(now.getMonth() - 3);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        params.startDate = startDate.toISOString();
        params.endDate = now.toISOString();
      }
      if (serviceFilter !== "all") {
        params.category = serviceFilter;
      }
      if (cityFilter !== "all") {
        params.city = cityFilter;
      }

      const data = await api.getAnalytics(params);
      setAnalytics(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : tr.common.error;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <div className="text-center py-12">{tr.common.loading}</div>;
  }

  const statusChartData = analytics.requestsByStatus.map((item) => ({
    name:
      item.status === "new"
        ? lang === "kaz"
          ? "Жаңа"
          : "Новые"
        : item.status === "in_progress"
        ? lang === "kaz"
          ? "Жұмыс істеуде"
          : "В работе"
        : lang === "kaz"
        ? "Аяқталды"
        : "Завершены",
    value: item.count,
    status: item.status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-semibold">{tr.analytics.title}</h2>
        <div className="flex gap-2 flex-wrap">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={lang === "kaz" ? "Кезең" : "Период"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === "kaz" ? "Барлық уақыт" : "Все время"}</SelectItem>
              <SelectItem value="week">{lang === "kaz" ? "Апта" : "Неделя"}</SelectItem>
              <SelectItem value="month">{lang === "kaz" ? "Ай" : "Месяц"}</SelectItem>
              <SelectItem value="quarter">{lang === "kaz" ? "Тоқсан" : "Квартал"}</SelectItem>
              <SelectItem value="year">{lang === "kaz" ? "Жыл" : "Год"}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={(value: ServiceCategory | "all") => setServiceFilter(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={lang === "kaz" ? "Қызмет" : "Услуга"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tr.common.all}</SelectItem>
              <SelectItem value="real-estate">{lang === "kaz" ? "Меншік" : "Недвижимость"}</SelectItem>
              <SelectItem value="automobiles">{lang === "kaz" ? "Авто" : "Авто"}</SelectItem>
              <SelectItem value="other">{lang === "kaz" ? "Басқа" : "Другое"}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={lang === "kaz" ? "Қала" : "Город"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === "kaz" ? "Барлық қалалар" : "Все города"}</SelectItem>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tr.analytics.totalServices}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {lang === "kaz" ? "Белсенді қызметтер" : "Активных услуг"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tr.analytics.completedRequests}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.completedRequests}</div>
            <p className="text-xs text-muted-foreground">
              {lang === "kaz" ? "Аяқталған өтініштер" : "Завершенных заявок"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tr.analytics.pendingRequests}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              {lang === "kaz" ? "Күтудегі өтініштер" : "Ожидающих заявок"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tr.analytics.revenue}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.revenue.toLocaleString()} ₸</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {lang === "kaz" ? "+12% айына" : "+12% за месяц"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Requests by Status - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{tr.analytics.requestsByStatus}</CardTitle>
            <CardDescription>
              {lang === "kaz" ? "Күй бойынша өтініштердің таралуы" : "Распределение заявок по статусам"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.status === "completed" ? "#22c55e" : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Requests by Service - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{tr.analytics.requestsByService}</CardTitle>
            <CardDescription>
              {lang === "kaz" ? "Әр қызмет бойынша өтініштер саны" : "Количество заявок по каждой услуге"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.requestsByService}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="serviceName" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Month - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{tr.analytics.revenueByMonth}</CardTitle>
            <CardDescription>
              {lang === "kaz" ? "Кезең бойынша табыс динамикасы" : "Динамика дохода за период"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value?: number) => `${(value ?? 0).toLocaleString()} ₸`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#00C49F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Requests by City - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{tr.analytics.requestsByCity}</CardTitle>
            <CardDescription>
              {lang === "kaz" ? "Қалалар бойынша өтініштердің таралуы" : "Распределение заявок по городам"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.requestsByCity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="city" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
