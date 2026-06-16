"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Star, Award, XCircle, AlertTriangle, Megaphone, Bell, Inbox, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<any>; colorClass: string; label: string }> = {
  SUBMITTED: {
    icon: CheckCircle2,
    colorClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    label: "Submitted",
  },
  SHORTLISTED: {
    icon: Star,
    colorClass: "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
    label: "Shortlisted",
  },
  APPROVED: {
    icon: Award,
    colorClass: "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    label: "Approved",
  },
  REJECTED: {
    icon: XCircle,
    colorClass: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    label: "Rejected",
  },
  UPDATE_REQUIRED: {
    icon: AlertTriangle,
    colorClass: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400",
    label: "Action Required",
  },
  ANNOUNCEMENT: {
    icon: Megaphone,
    colorClass: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    label: "Announcement",
  },
};

export default function PortalNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
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
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string, isRead: boolean) => {
    try {
      const res = await fetch("/api/portal/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead } : n))
        );
        toast.success(isRead ? "Marked as read" : "Marked as unread");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update notification.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/portal/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update notifications.");
    }
  };

  const handleAction = (item: NotificationItem) => {
    if (!item.isRead) {
      handleMarkRead(item.id, true);
    }
    if (item.actionUrl) {
      router.push(item.actionUrl);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const renderNotificationList = (list: NotificationItem[]) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800/50">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-dark dark:text-white">Inbox Clean</h3>
          <p className="mt-2 text-sm text-dark-6 max-w-sm">
            No notifications here. We will notify you when application statuses change or announcements are published.
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-stroke dark:divide-dark-3">
        {list.map((item) => {
          const config = TYPE_CONFIG[item.type] || { icon: Bell, colorClass: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400", label: "Notification" };
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-4 py-5 transition-colors",
                !item.isRead && "bg-blue-50/10 dark:bg-[#FFFFFF02] -mx-4 px-4 rounded-lg"
              )}
            >
              <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0 mt-0.5", config.colorClass)}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={cn("text-base font-semibold text-dark dark:text-white", !item.isRead && "text-primary")}>
                        {item.title}
                      </h4>
                      <Badge className={cn("text-2xs font-normal border py-0", config.colorClass)}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-dark-5 dark:text-dark-6 whitespace-pre-wrap max-w-2xl">
                      {item.message}
                    </p>
                  </div>
                  <span className="text-xs text-dark-6 whitespace-nowrap pt-0.5">
                    {new Date(item.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  {item.actionUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-semibold cursor-pointer border-primary text-primary hover:bg-primary/10"
                      onClick={() => handleAction(item)}
                    >
                      Take Action
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs font-semibold text-dark-6 hover:text-primary cursor-pointer"
                    onClick={() => handleMarkRead(item.id, !item.isRead)}
                  >
                    {item.isRead ? "Mark as unread" : "Mark as read"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-4 font-bold text-dark dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-dark-6">
            View status updates, requests for modifications, and official announcements.
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button
            size="sm"
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <CheckSquare className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <Card className="border border-stroke shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <CardHeader className="pb-0 border-b border-stroke dark:border-dark-3">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between pb-3">
              <TabsList className="grid grid-cols-2 w-48">
                <TabsTrigger value="all" className="text-xs font-semibold cursor-pointer">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs font-semibold cursor-pointer">
                  Unread
                </TabsTrigger>
              </TabsList>
              <Badge variant="secondary" className="font-semibold text-xs py-0.5">
                {notifications.length} Total
              </Badge>
            </div>
            
            <CardContent className="pt-6 px-0 pb-6">
              {loading ? (
                <div className="py-16 text-center text-sm text-dark-6">Loading notifications...</div>
              ) : (
                <>
                  <TabsContent value="all" className="m-0 focus-visible:outline-none">
                    {renderNotificationList(notifications)}
                  </TabsContent>
                  <TabsContent value="unread" className="m-0 focus-visible:outline-none">
                    {renderNotificationList(unreadNotifications)}
                  </TabsContent>
                </>
              )}
            </CardContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
