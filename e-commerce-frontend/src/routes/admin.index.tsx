import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/services/adminApi";
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, Bell, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

const LUXURY_COLORS = ["#000000", "#404040", "#737373", "#a3a3a3", "#d4d4d4"];

function AdminOverview() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminApi.getOverview>> | null>(null);

  useEffect(() => {
    adminApi.getOverview().then(setData);
  }, []);

  const stats = [
    { label: "Total Revenue", value: data ? `RS. ${data.totalRevenue.toLocaleString()}` : "—", icon: DollarSign, hint: "+12.4% vs last week" },
    { label: "Total Orders", value: data?.totalOrders ?? "—", icon: ShoppingBag, hint: "+5 today" },
    { label: "Active Products", value: data?.activeProducts ?? "—", icon: Package, hint: "Across 3 categories" },
    { label: "Customers", value: data?.customers ?? "—", icon: Users, hint: "+2 this week" },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">Real-time boutique performance and acquisition metrics.</p>
        </div>
      </div>

      {/* Alerts Section */}
      {(data?.alerts.lowStock.length ?? 0) > 0 || (data?.alerts.pendingOrders.length ?? 0) > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {typeof data?.alerts.lowStock.length === 'number' && data.alerts.lowStock.length > 0 ? (
            <Card className="bg-red-600 border-none shadow-lg rounded-none">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center bg-white text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Critical Inventory</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-white">{data.alerts.lowStock.length}</span>
                    <p className="text-sm font-medium text-white/80">Products Out/Low Stock</p>
                  </div>
                </div>
                <Link to="/admin/products">
                  <Button variant="outline" className="bg-white text-red-600 border-none hover:bg-white/90 rounded-none font-bold uppercase tracking-wider text-[10px] h-10 px-6">
                    Restock
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {typeof data?.alerts.pendingOrders.length === 'number' && data.alerts.pendingOrders.length > 0 ? (
            <Card className="bg-zinc-900 border-none shadow-lg rounded-none">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center bg-white text-black">
                  <Bell className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Fulfillment Queue</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-white">{data.alerts.pendingOrders.length}</span>
                    <p className="text-sm font-medium text-white/80">Orders Pending Action</p>
                  </div>
                </div>
                <Link to="/admin/orders">
                  <Button variant="outline" className="bg-white text-black border-none hover:bg-white/90 rounded-none font-bold uppercase tracking-wider text-[10px] h-10 px-6">
                    Process
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {/* Primary Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="shadow-card border-none rounded-none bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground opacity-30" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tighter">{s.value}</div>
                <p className="mt-1 text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">{s.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Revenue Bar Chart */}
        <Card className="lg:col-span-2 shadow-card border-none rounded-none bg-white overflow-hidden">
          <CardHeader className="border-b border-secondary/10 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-zinc-400" />
              <CardTitle className="text-xs font-bold uppercase tracking-[0.2em]">Monthly Revenue Sequence</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthlyRevenue ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#a3a3a3' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#a3a3a3' }} 
                  />
                  <Tooltip
                    cursor={{ fill: '#f8f8f8' }}
                    contentStyle={{
                      background: "#000",
                      border: "none",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      borderRadius: 0,
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="revenue" fill="#000" radius={[2, 2, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category Pie Chart */}
        <Card className="shadow-card border-none rounded-none bg-white overflow-hidden">
          <CardHeader className="border-b border-secondary/10 pb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-zinc-400" />
              <CardTitle className="text-xs font-bold uppercase tracking-[0.2em]">Category Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.salesByCategory ?? []}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {data?.salesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={LUXURY_COLORS[index % LUXURY_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: "#000", 
                      border: "none", 
                      borderRadius: 0, 
                      fontSize: 10, 
                      fontWeight: 700, 
                      color: "#fff",
                      textTransform: "uppercase" 
                    }} 
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend (Original Chart - Re-styled) */}
      <Card className="shadow-card border-none rounded-none bg-white overflow-hidden">
        <CardHeader className="border-b border-secondary/10 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-[0.2em]">Weekly Acquisition Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.sales7d ?? []} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#a3a3a3' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#a3a3a3' }} 
                />
                <Tooltip
                  contentStyle={{
                    background: "#000",
                    border: "none",
                    borderRadius: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#fff",
                    textTransform: "uppercase"
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="sales" stroke="#000" strokeWidth={3} fill="url(#salesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
