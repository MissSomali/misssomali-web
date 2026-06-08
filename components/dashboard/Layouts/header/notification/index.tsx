"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "../../../ui/dropdown";
import { useIsMobile } from "../../../hooks/use-mobile";
import { cn } from "../../../utils";
import Link from "next/link";
import { useState } from "react";
import { BellIcon } from "./icons";

const notificationList = [
  {
    initials: "PJ",
    bg: "bg-blue-100 text-blue-800",
    title: "Piter Joined the Team!",
    subTitle: "Congratulate him",
    time: "2 mins ago"
  },
  {
    initials: "DS",
    bg: "bg-green-100 text-green-800",
    title: "New application received",
    subTitle: "Devid sent application draft",
    time: "1 hour ago"
  },
  {
    initials: "PR",
    bg: "bg-amber-100 text-amber-800",
    title: "Document approved",
    subTitle: "Verification complete for Huda",
    time: "3 hours ago"
  },
  {
    initials: "JC",
    bg: "bg-purple-100 text-purple-800",
    title: "New feedback posted",
    subTitle: "Admin added review comments",
    time: "1 day ago"
  },
];

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDotVisible, setIsDotVisible] = useState(true);
  const isMobile = useIsMobile();

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
        if (setIsDotVisible) setIsDotVisible(false);
      }}
    >
      <DropdownTrigger
        className="grid size-12 cursor-pointer place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3 dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon className="size-5" />

          {isDotVisible && (
            <span
              className={cn(
                "absolute top-0 right-0 z-1 size-2 rounded-full bg-red ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-xl min-[350px]:min-w-[20rem] dark:border-dark-3 dark:bg-gray-dark rounded-xl"
      >
        <div className="mb-2 flex items-center justify-between px-2 py-1.5 border-b border-gray-100 dark:border-dark-3">
          <span className="text-sm font-bold text-dark dark:text-white">
            Notifications
          </span>
          <span className="rounded-md bg-[#0B2D6B] px-2.25 py-0.5 text-[10px] font-bold text-white">
            4 new
          </span>
        </div>

        <ul className="mb-3 max-h-80 space-y-1.5 overflow-y-auto custom-scrollbar">
          {notificationList.map((item, index) => (
            <li key={index} role="menuitem">
              <Link
                href="#"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 rounded-lg px-2 py-2 outline-none hover:bg-gray-50 focus-visible:bg-gray-50 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold", item.bg)}>
                  {item.initials}
                </span>

                <div className="flex-1 min-w-0">
                  <strong className="block text-xs font-bold text-dark dark:text-white truncate">
                    {item.title}
                  </strong>

                  <span className="block truncate text-xs text-gray-500 dark:text-dark-6">
                    {item.subTitle}
                  </span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">
                    {item.time}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="#"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-[#0B2D6B] p-2 text-center text-xs font-semibold text-[#0B2D6B] hover:bg-gray-50 transition-colors dark:border-dark-3 dark:text-dark-6 dark:hover:bg-dark-3"
        >
          See all notifications
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
