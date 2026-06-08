"use client";

import { cn } from "../../utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import { LogOut } from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type SidebarProps = {
  navigation: NavItem[];
  brandText: string;
  onSignOut: () => void;
};

export function Sidebar({ navigation, brandText, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-width duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full min-w-[260px]" : "w-0",
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col py-6 pl-[25px] pr-[7px]">
          {/* Logo Header */}
          <div className="relative pr-4.5 flex items-center justify-between h-12">
            <Link
              href="/"
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 flex items-center space-x-2"
            >
              <div className="relative w-36 h-8">
                <Image
                  src="/logo.png"
                  alt="Miss Somali Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  className="dark:invert"
                  priority
                />
              </div>
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeftIcon className="ml-auto size-7 text-dark-4 dark:text-dark-6" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="custom-scrollbar mt-10 flex-1 overflow-y-auto pr-3">
            <div className="mb-6">
              <h2 className="mb-5 text-xs font-semibold text-dark-4 uppercase tracking-wider dark:text-dark-6">
                Navigation
              </h2>

              <nav role="navigation" aria-label="Main navigation links">
                <ul className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                      <li key={item.name}>
                        <MenuItem
                          as="link"
                          href={item.href}
                          isActive={isActive}
                          className="flex items-center gap-3 py-3 rounded-xl hover:bg-gray-50/50 hover:text-[#0B2D6B] dark:hover:bg-[#FFFFFF1A] dark:hover:text-white"
                        >
                          <item.icon
                            className={cn(
                              "size-5 shrink-0 transition-colors",
                              isActive ? "text-[#0B2D6B] dark:text-white" : "text-gray-400 group-hover:text-[#0B2D6B]"
                            )}
                          />
                          <span className="text-sm font-semibold">{item.name}</span>
                        </MenuItem>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>

          {/* Logout button at the bottom */}
          <div className="flex-shrink-0 p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={onSignOut}
              className="w-full flex items-center px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-700" />
              Sign Out
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
