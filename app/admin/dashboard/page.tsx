"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  Bell, 
  Settings, 
  Calendar, 
  History, 
  ArrowRight,
  Loader2,
  TrendingUp,
  Globe
} from "lucide-react";
import { cn } from "@/components/dashboard/utils";
import { compactFormat } from "@/components/dashboard/format-number";
import type { ApexOptions } from "apexcharts";

// Load our custom resilient ApexCharts wrapper dynamically to disable SSR rendering
const Chart = dynamic(() => import("@/components/dashboard/ApexChartWrapper"), {
  ssr: false,
});

interface Metrics {
  totalContestants: number;
  totalApplications: number;
  pendingCount: number;
  shortlistedCount: number;
  approvedCount: number;
  rejectedCount: number;
}

interface Application {
  id: string;
  userId: string;
  status: string;
  appliedAt: string;
  country: string;
  user: {
    fullName: string;
    phone: string;
  };
}

interface AuditLog {
  id: string;
  adminAuthUserId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

interface DashboardData {
  metrics: Metrics;
  countryBreakdown: { country: string; count: number }[];
  recentApplications: Application[];
  recentLogs: AuditLog[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError("Failed to fetch dashboard statistics");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred loading dashboard statistics");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 min-h-[50vh]">
        <Loader2 className="animate-spin h-10 w-10 text-[#0B2D6B] mb-4" />
        <span className="text-sm font-semibold text-[#071E4A]/70 dark:text-dark-6">Loading dashboard statistics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center max-w-xl mx-auto my-12">
        <p className="text-red-800 dark:text-red-400 font-semibold">{error || "Could not load stats"}</p>
      </div>
    );
  }

  const { metrics, recentApplications, recentLogs, countryBreakdown } = data;

  const statCards = [
    {
      title: "Total Contestants",
      value: metrics.totalContestants,
      growth: "+14.8%",
      growthColor: "text-green",
      icon: Users,
      iconBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Applications Submitted",
      value: metrics.totalApplications,
      growth: "+22.4%",
      growthColor: "text-green",
      icon: FileText,
      iconBg: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
    },
    {
      title: "Pending Reviews",
      value: metrics.pendingCount,
      growth: "-5.2%",
      growthColor: "text-amber-600",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Approved Finalists",
      value: metrics.approvedCount,
      growth: "+8.3%",
      growthColor: "text-green",
      icon: CheckCircle,
      iconBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
  ];

  const quickActions = [
    { name: "Broadcast Msg", href: "/admin/notifications", icon: Bell, border: "hover:border-[#E8C97A]" },
    { name: "Create Event", href: "/admin/events", icon: Calendar, border: "hover:border-[#0B2D6B]" },
    { name: "System Logs", href: "/admin/audit-logs", icon: History, border: "hover:border-slate-400" },
    { name: "Settings", href: "/admin/settings", icon: Settings, border: "hover:border-stone-400" },
  ];

  // 1. Line/Area Chart options (Application trends over the year)
  const areaChartOptions: ApexOptions = {
    legend: { show: false },
    colors: ["#0B2D6B", "#E8C97A"],
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    fill: {
      gradient: {
        opacityFrom: 0.45,
        opacityTo: 0,
      },
    },
    stroke: { curve: "smooth", width: 3 },
    grid: {
      strokeDashArray: 5,
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
  };

  const areaChartSeries = [
    {
      name: "Applications",
      data: [15, 30, 45, 65, 80, 110, 140, 165, 195, 230, 260, metrics.totalApplications],
    },
    {
      name: "Approved",
      data: [5, 12, 18, 25, 32, 45, 52, 60, 75, 88, 98, metrics.approvedCount],
    },
  ];

  // 2. Donut Chart options (Application Status Breakdown)
  const donutChartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    colors: ["#F59E0B", "#6366F1", "#10B981", "#EF4444"],
    labels: ["Pending", "Shortlisted", "Approved", "Rejected"],
    legend: {
      show: true,
      position: "bottom",
      itemMargin: { horizontal: 10, vertical: 5 },
      formatter: (legendName, opts) => {
        const val = opts ? opts.w.globals.series[opts.seriesIndex] : "";
        return `${legendName}: ${val}`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Applications",
              fontSize: "12px",
              fontWeight: "500",
              formatter: () => metrics.totalApplications.toString(),
            },
            value: {
              fontSize: "20px",
              fontWeight: "bold",
              formatter: (val) => String(val),
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  const donutChartSeries = [
    metrics.pendingCount,
    metrics.shortlistedCount,
    metrics.approvedCount,
    metrics.rejectedCount,
  ];

  // 3. Weekly Activity Bar Chart options
  const barChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    colors: ["#0B2D6B"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "40%",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      strokeDashArray: 5,
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
  };

  const barChartSeries = [
    {
      name: "Submissions",
      data: [4, 8, 12, 7, 10, 15, 9],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-dark dark:text-white">Dashboard Overview</h2>
          <p className="text-xs text-gray-500 font-medium">Real-time indicators, submission patterns, and logs.</p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {quickActions.map((action, idx) => (
            <Link 
              key={idx} 
              href={action.href} 
              className={cn(
                "flex items-center px-4 py-2 border border-gray-200 bg-white text-xs font-bold text-dark rounded-full hover:shadow-sm dark:bg-gray-dark dark:border-gray-800 dark:text-white transition-all",
                action.border
              )}
            >
              <action.icon className="h-4 w-4 text-[#0B2D6B] mr-2" />
              <span>{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-dark flex items-center justify-between transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.title}</span>
              <h3 className="text-2xl font-black text-dark dark:text-white">{card.value}</h3>
              <div className="flex items-center text-[10px] font-semibold gap-1">
                <span className={card.growthColor}>{card.growth}</span>
                <span className="text-gray-400">vs last week</span>
              </div>
            </div>
            <div className={cn("p-3.5 rounded-xl border border-gray-100 dark:border-gray-800", card.iconBg)}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Layout Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Area Trend Chart: 8 cols on XL */}
        <div className="col-span-12 xl:col-span-8 bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-dark dark:text-white">Application Volume & Approvals</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-dark-2 px-2.5 py-1 rounded-full">Annual Trend</span>
          </div>
          <div className="-ml-3 h-[300px]">
            <Chart
              options={areaChartOptions}
              series={areaChartSeries}
              type="area"
              height={300}
            />
          </div>
        </div>

        {/* Donut Chart: 4 cols on XL */}
        <div className="col-span-12 xl:col-span-4 bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-dark dark:text-white">Status Distribution</h3>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Contestant approval phase ratios.</p>
          </div>
          <div className="grid place-items-center py-2">
            <Chart
              options={donutChartOptions}
              series={donutChartSeries}
              type="donut"
              width={290}
            />
          </div>
        </div>
      </div>

      {/* Second Charts & Lists Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Weekly activity: 4 cols */}
        <div className="col-span-12 xl:col-span-4 bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-dark dark:text-white">Submission Frequency</h3>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Weekly submissions trend.</p>
          </div>
          <div className="-ml-3 h-[240px]">
            <Chart
              options={barChartOptions}
              series={barChartSeries}
              type="bar"
              height={240}
            />
          </div>
        </div>

        {/* Country Breakdown: 4 cols */}
        <div className="col-span-12 md:col-span-6 xl:col-span-4 bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
            <h3 className="text-sm font-bold text-dark dark:text-white">Demographics</h3>
            <Globe className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-56 pr-1">
            {countryBreakdown.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No geolocation files available.</p>
            ) : (
              countryBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-600 dark:text-dark-6">{item.country}</span>
                  <div className="flex items-center gap-3 flex-1 justify-end ml-4">
                    <div className="w-24 bg-gray-100 dark:bg-dark-2 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#0B2D6B] h-full rounded-full" 
                        style={{ width: `${(item.count / metrics.totalApplications) * 100}%` }}
                      />
                    </div>
                    <span className="text-dark dark:text-white min-w-4 text-right">{item.count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Logs Timeline: 4 cols */}
        <div className="col-span-12 md:col-span-6 xl:col-span-4 bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
            <h3 className="text-sm font-bold text-dark dark:text-white">Administrative Actions</h3>
            <Link href="/admin/audit-logs" className="text-[10px] font-bold text-[#0B2D6B] flex items-center hover:underline">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar max-h-56 pr-1">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No administrative logs recorded.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex gap-3 text-xs items-start">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-dark dark:text-white truncate capitalize">
                      {log.actionType.toLowerCase().replace("_", " ")} {log.targetType.toLowerCase()}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      ID: <span className="font-mono text-gray-500">{log.targetId.substring(0, 8)}</span>
                    </p>
                  </div>
                  <span className="text-[9px] font-semibold text-gray-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-dark dark:text-white">Recent Application Submissions</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Validate and review contestant profiles.</p>
          </div>
          <Link href="/admin/applications" className="text-[10px] font-bold text-[#0B2D6B] flex items-center hover:underline">
            View All Applications <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-semibold">
                <th className="pb-3 text-left">Applicant Name</th>
                <th className="pb-3 text-center">Country of Origin</th>
                <th className="pb-3 text-center">Date Applied</th>
                <th className="pb-3 text-center">Current Status</th>
                <th className="pb-3 text-right">Review Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {recentApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">No candidate application records found.</td>
                </tr>
              ) : (
                recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-2/40 transition-colors">
                    <td className="py-3.5 font-bold text-dark dark:text-white">
                      {app.user.fullName}
                      <span className="block text-[10px] font-semibold text-gray-400 mt-0.5">{app.user.phone}</span>
                    </td>
                    <td className="py-3.5 text-center text-gray-600 dark:text-dark-6 font-semibold">{app.country}</td>
                    <td className="py-3.5 text-center text-gray-500 font-medium">
                      {new Date(app.appliedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        app.status === "approved"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                          : app.status === "pending"
                          ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                          : app.status === "shortlisted"
                          ? "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50"
                          : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50"
                      )}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link 
                        href={`/admin/applications/${app.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-[#0B2D6B]/5 text-[#0B2D6B] hover:bg-[#0B2D6B] hover:text-white dark:bg-white/5 dark:text-white dark:hover:bg-[#E8C97A] dark:hover:text-[#071E4A] transition-colors"
                        title="Review profile applications wizard"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
