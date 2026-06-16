"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/dashboard/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BellIcon } from "./icons";
import { useRouter } from "next/navigation";
import { formatMessageTime } from "@/components/dashboard/format-message-time";
import { CheckCircle2, Star, Award, XCircle, AlertTriangle, Megaphone, Bell } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<any>; colorClass: string }> = {
  SUBMITTED: {
    icon: CheckCircle2,
    colorClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  SHORTLISTED: {
    icon: Star,
    colorClass: "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
  },
  APPROVED: {
    icon: Award,
    colorClass: "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  },
  REJECTED: {
    icon: XCircle,
    colorClass: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  },
  UPDATE_REQUIRED: {
    icon: AlertTriangle,
    colorClass: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400",
  },
  ANNOUNCEMENT: {
    icon: Megaphone,
    colorClass: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  },
};

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/portal/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh on dropdown open
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/portal/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    setIsOpen(false);
    if (!item.isRead) {
      try {
        await fetch("/api/portal/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Error marking notification read:", err);
      }
    }

    if (item.actionUrl) {
      router.push(item.actionUrl);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <DropdownTrigger
        className="grid size-12 cursor-pointer place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3 dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute top-0 right-0 z-1 size-2.5 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md min-[350px]:min-w-[22rem] dark:border-dark-3 dark:bg-gray-dark"
      >
        <div className="mb-2 flex items-center justify-between px-2 py-1.5 border-b border-stroke dark:border-dark-3 pb-2.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary px-2.25 py-0.5 text-xs font-medium text-white">
                {unreadCount} new
              </span>
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Mark all read
              </button>
            </div>
          )}
        </div>

        <ul className="mb-3 max-h-92 space-y-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-8 text-center text-sm text-dark-6">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-dark-6">No notifications yet.</div>
          ) : (
            notifications.slice(0, 10).map((item) => {
              const config = TYPE_CONFIG[item.type] || { icon: Bell, colorClass: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" };
              const Icon = config.icon;

              return (
                <li key={item.id} role="menuitem">
                  <button
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-lg px-2 py-2.5 text-left outline-none transition-colors hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3",
                      !item.isRead && "bg-blue-light-5/20 dark:bg-[#FFFFFF08]"
                    )}
                  >
                    <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", config.colorClass)}>
                      <Icon className="size-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <strong className={cn(
                          "block text-sm font-medium text-dark dark:text-white truncate",
                          !item.isRead && "font-semibold text-primary"
                        )}>
                          {item.title}
                        </strong>
                        <span className="text-2xs text-dark-6 shrink-0 whitespace-nowrap">
                          {formatMessageTime(item.createdAt)}
                        </span>
                      </div>

                      <p className="truncate text-sm text-dark-5 dark:text-dark-6 mt-0.5 max-w-[15rem]">
                        {item.message}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <Link
          href="/portal/notifications"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary transition-colors outline-none hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          See all notifications
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
