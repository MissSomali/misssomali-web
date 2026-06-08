"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePortal } from "./layout";
import {
  FileText,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  Bell,
  ArrowRight,
  ClipboardList,
  Clock,
  Loader2
} from "lucide-react";
import { cn } from "@/components/dashboard/utils";

interface ApplicationData {
  id: string;
  isSubmitted: boolean;
  status: string;
  updatedAt: string;
}

export default function PortalDashboard() {
  const { profile } = usePortal();
  const [appData, setAppData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch("/api/portal/application");
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setAppData(data);
          }
        }
      } catch (err) {
        console.error("Failed to load application status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, []);

  const getApplicationStatus = () => {
    if (!appData) {
      return {
        label: "Not Started",
        color: "text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800 dark:text-gray-400",
        desc: "You have not started your contestant application yet. Open the wizard below to begin."
      };
    }
    if (!appData.isSubmitted) {
      return {
        label: "Draft Saved",
        color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400",
        desc: "You have saved your application details as draft but haven't submitted them for review yet."
      };
    }
    
    switch (appData.status) {
      case "pending":
        return {
          label: "Under Review",
          color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400",
          desc: "Your application has been locked and is currently being audited by the selection board."
        };
      case "shortlisted":
        return {
          label: "Shortlisted",
          color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/50 dark:text-purple-400",
          desc: "Congratulations! You have been shortlisted for the secondary interview rounds."
        };
      case "approved":
        return {
          label: "Approved (Finalist)",
          color: "text-green bg-green-light-7 border-green-light-5 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400",
          desc: "Excellent! You are officially approved as a Miss Somali 2026 Grandfinal finalist."
        };
      case "rejected":
        return {
          label: "Not Selected",
          color: "text-red bg-red-light-6 border-red-light-4 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400",
          desc: "We regret to inform you that your application was not selected for this pageant cycle."
        };
      default:
        return {
          label: "Unknown",
          color: "text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800 dark:text-gray-400",
          desc: "Application state status is currently unavailable."
        };
    }
  };

  const statusInfo = getApplicationStatus();

  const timelineSteps = [
    { name: "Registration", completed: true, current: false },
    { name: "Draft Submission", completed: !!appData, current: !appData },
    { name: "Board Review", completed: !!appData?.isSubmitted, current: !!(appData && !appData.isSubmitted) },
    { name: "Final Results", completed: appData?.status === "approved" || appData?.status === "shortlisted" || appData?.status === "rejected", current: !!(appData?.isSubmitted && appData.status === "pending") }
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 min-h-[50vh]">
        <Loader2 className="animate-spin h-10 w-10 text-[#0B2D6B] mb-4" />
        <span className="text-sm font-semibold text-[#071E4A]/70 dark:text-dark-6">Loading contestant portal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-[#0B2D6B] dark:bg-gray-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm flex flex-col justify-between">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 w-1/3 pointer-events-none">
          <div className="w-full h-full border-4 border-[#E8C97A] rounded-full translate-x-1/2 translate-y-1/3" />
        </div>
        <div className="relative z-10 space-y-2 max-w-xl">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#E8C97A]">
            Welcome back, {profile?.fullName}!
          </h1>
          <p className="text-xs md:text-sm text-white/80 leading-relaxed font-medium">
            Manage your pageantry registration portfolio, upload your official presentation headshots, view timeline calendar milestones, and receive notifications.
          </p>
        </div>
      </div>

      {/* Main Grid: Application Status & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Status Card */}
        <div className="lg:col-span-1 bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Application Status</span>
              <span className={cn("px-3 py-0.5 text-[10px] font-bold rounded-full border", statusInfo.color)}>
                {statusInfo.label}
              </span>
            </div>
            
            <h3 className="text-sm font-bold text-dark dark:text-white">Miss Somali 2026 Submission</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {statusInfo.desc}
            </p>
          </div>

          <div className="mt-8 pt-3">
            {!appData ? (
              <Link
                href="/portal/application"
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-full text-xs font-bold text-white bg-[#0B2D6B] hover:bg-[#071E4A] transition-colors shadow-sm"
              >
                Start Application Wizard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : !appData.isSubmitted ? (
              <Link
                href="/portal/application"
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-full text-xs font-bold text-white bg-[#0B2D6B] hover:bg-[#071E4A] transition-colors shadow-sm"
              >
                Continue Application Draft <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/portal/status"
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 dark:border-gray-800 rounded-full text-xs font-bold text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
              >
                View Submission Receipt
              </Link>
            )}
          </div>
        </div>

        {/* Progress Timeline Card */}
        <div className="lg:col-span-2 bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-dark dark:text-white">Your Selection Journey</h3>
            <p className="text-xs text-gray-400 font-medium">
              The selection procedure updates in real time. Follow the milestones below.
            </p>
          </div>

          {/* Timeline Graphic */}
          <div className="mt-8 relative py-4">
            {/* Desktop Timeline Line */}
            <div className="hidden sm:block absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 dark:bg-gray-800 z-0 rounded-full" />
            
            <div className="hidden sm:flex justify-between items-center relative z-10">
              {timelineSteps.map((step, idx) => {
                const CircleIcon = step.completed ? CheckCircle2 : step.current ? Clock : ClipboardList;
                return (
                  <div key={idx} className="flex flex-col items-center text-center max-w-[120px]">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        step.completed
                          ? "bg-[#0B2D6B] border-[#0B2D6B] text-white"
                          : step.current
                          ? "bg-amber-50 border-[#E8C97A] text-[#E8C97A] dark:bg-amber-950/20"
                          : "bg-white border-gray-200 text-gray-300 dark:bg-gray-dark dark:border-gray-800"
                      )}
                    >
                      <CircleIcon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "mt-2.5 text-[10px] font-bold uppercase tracking-wider",
                        step.completed ? "text-dark dark:text-white" : step.current ? "text-[#E8C97A]" : "text-gray-400"
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Timeline List */}
            <div className="sm:hidden flex flex-col space-y-4">
              {timelineSteps.map((step, idx) => {
                const CircleIcon = step.completed ? CheckCircle2 : step.current ? Clock : ClipboardList;
                return (
                  <div key={idx} className="flex items-center space-x-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center border-2",
                        step.completed
                          ? "bg-[#0B2D6B] border-[#0B2D6B] text-white"
                          : step.current
                          ? "bg-amber-50 border-[#E8C97A] text-[#E8C97A] dark:bg-amber-950/20"
                          : "bg-white border-gray-200 text-gray-300 dark:bg-gray-dark dark:border-gray-800"
                      )}
                    >
                      <CircleIcon className="h-4 w-4" />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        step.completed ? "text-dark dark:text-white" : step.current ? "text-[#E8C97A]" : "text-gray-400"
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Dashboard Action Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-dark dark:text-white">Contestant Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/portal/application"
            className="group block bg-white hover:bg-gray-50/50 border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-xl bg-[#0B2D6B]/5 text-[#0B2D6B] flex items-center justify-center group-hover:bg-[#0B2D6B] group-hover:text-white transition-all duration-200 mb-4 dark:bg-white/5 dark:text-white dark:group-hover:bg-[#E8C97A] dark:group-hover:text-[#071E4A]">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-dark dark:text-white mb-1">Application Wizard</h4>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Complete your application file details and review documents.</p>
          </Link>

          <Link
            href="/portal/media"
            className="group block bg-white hover:bg-gray-50/50 border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-xl bg-[#0B2D6B]/5 text-[#0B2D6B] flex items-center justify-center group-hover:bg-[#0B2D6B] group-hover:text-white transition-all duration-200 mb-4 dark:bg-white/5 dark:text-white dark:group-hover:bg-[#E8C97A] dark:group-hover:text-[#071E4A]">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-dark dark:text-white mb-1">Media Portfolio</h4>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Upload official portraits, full-body snapshots, and clips.</p>
          </Link>

          <Link
            href="/portal/notifications"
            className="group block bg-white hover:bg-gray-50/50 border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-xl bg-[#0B2D6B]/5 text-[#0B2D6B] flex items-center justify-center group-hover:bg-[#0B2D6B] group-hover:text-white transition-all duration-200 mb-4 dark:bg-white/5 dark:text-white dark:group-hover:bg-[#E8C97A] dark:group-hover:text-[#071E4A]">
              <Bell className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-dark dark:text-white mb-1">Inbox Alerts</h4>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Read announcements, interview board feedback, and instructions.</p>
          </Link>

          <Link
            href="/portal/events"
            className="group block bg-white hover:bg-gray-50/50 border border-gray-200 dark:border-gray-800 dark:bg-gray-dark rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-xl bg-[#0B2D6B]/5 text-[#0B2D6B] flex items-center justify-center group-hover:bg-[#0B2D6B] group-hover:text-white transition-all duration-200 mb-4 dark:bg-white/5 dark:text-white dark:group-hover:bg-[#E8C97A] dark:group-hover:text-[#071E4A]">
              <Calendar className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-dark dark:text-white mb-1">Pageant Calendar</h4>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Track scheduled interview dates, live bootcamps, and finale details.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
