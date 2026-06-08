"use client";

import { SearchIcon } from "../../icons";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import Link from "next/link";
import Image from "next/image";

type HeaderProps = {
  user: {
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
  title: string;
  subtitle: string;
  onSignOut: () => void;
  profileUrl: string;
  settingsUrl: string;
};

export function Header({
  user,
  title,
  subtitle,
  onSignOut,
  profileUrl,
  settingsUrl,
}: HeaderProps) {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="border-stroke shadow-sm dark:border-stroke-dark dark:bg-gray-dark sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-4 md:px-6 2xl:px-10">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="dark:border-stroke-dark rounded-lg border px-1.5 py-1 lg:hidden dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] text-dark-4 dark:text-dark-6 border-gray-200"
        >
          <MenuIcon className="size-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        {isMobile && (
          <Link href="/" className="flex items-center">
            <div className="relative w-28 h-8">
              <Image
                src="/logo.png"
                fill
                style={{ objectFit: "contain" }}
                alt="Miss Somali"
                className="dark:invert"
              />
            </div>
          </Link>
        )}

        <div className="hidden lg:block">
          <h1 className="text-lg font-bold text-dark dark:text-white">
            {title}
          </h1>
          <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full max-w-60 hidden md:block">
          <input
            type="search"
            placeholder="Search..."
            className="bg-gray-50 text-xs font-semibold focus-visible:border-[#0B2D6B] dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:hover:text-dark-6 dark:focus-visible:border-primary flex w-full items-center gap-3 rounded-full border border-gray-200 py-2.5 pr-4 pl-10 transition-colors outline-none"
          />

          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 size-4 text-gray-400" />
        </div>

        <ThemeToggleSwitch />

        <Notification />

        <div className="shrink-0 border-l border-gray-100 pl-3 dark:border-dark-3">
          <UserInfo
            user={user}
            onSignOut={onSignOut}
            profileUrl={profileUrl}
            settingsUrl={settingsUrl}
          />
        </div>
      </div>
    </header>
  );
}
