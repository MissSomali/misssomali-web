"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Image as ImageIcon,
  Bell,
  Calendar,
  User,
  Loader2
} from "lucide-react";
import { SidebarProvider } from "@/components/dashboard/Layouts/sidebar/sidebar-context";
import { Sidebar } from "@/components/dashboard/Layouts/sidebar";
import { Header } from "@/components/dashboard/Layouts/header";

interface UserProfileData {
  authenticated: boolean;
  authUserId: string;
  email: string;
  fullName: string;
  role: string;
  profileId: string;
}

interface PortalContextType {
  profile: UserProfileData | null;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const PortalContext = createContext<PortalContextType>({
  profile: null,
  refreshProfile: async () => {},
  loading: true
});

export const usePortal = () => useContext(PortalContext);

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/role");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.role === "contestant") {
          setProfile(data);
        } else {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Error fetching profile in portal layout:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProfile]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#0B2D6B] mb-4" />
        <p className="text-sm font-semibold text-[#071E4A]/70">Loading contestant portal...</p>
      </div>
    );
  }

  if (!profile) return null;

  const navigation = [
    { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
    { name: "Application Wizard", href: "/portal/application", icon: FileText },
    { name: "Submission Status", href: "/portal/status", icon: CheckCircle },
    { name: "Media Gallery", href: "/portal/media", icon: ImageIcon },
    { name: "Inbox", href: "/portal/notifications", icon: Bell },
    { name: "Events Calendar", href: "/portal/events", icon: Calendar },
    { name: "Profile Settings", href: "/portal/profile", icon: User }
  ];

  return (
    <SidebarProvider>
      <PortalContext.Provider value={{ profile, refreshProfile: fetchProfile, loading }}>
        <div className="flex min-h-screen bg-gray-2 dark:bg-[#020D1A]">
          {/* Collapsible Left Sidebar */}
          <Sidebar
            navigation={navigation}
            brandText="Miss Somali Portal"
            onSignOut={handleSignOut}
          />

          {/* Content Display Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header
              user={{
                name: profile.fullName,
                email: profile.email,
                role: "contestant",
              }}
              title="Contestant Portal"
              subtitle="Track your application and event milestones"
              onSignOut={handleSignOut}
              profileUrl="/portal/profile"
              settingsUrl="/portal/profile"
            />

            <main className="isolate mx-auto w-full overflow-hidden p-4 md:p-6 2xl:p-10 bg-gray-2 dark:bg-[#020D1A] min-h-[calc(100vh-80px)]">
              {children}
            </main>
          </div>
        </div>
      </PortalContext.Provider>
    </SidebarProvider>
  );
}
