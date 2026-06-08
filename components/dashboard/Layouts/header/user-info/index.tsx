"use client";

import { ChevronUpIcon } from "../../../icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "../../../ui/dropdown";
import { cn } from "../../../utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";

type UserInfoProps = {
  user: {
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
  onSignOut: () => void;
  profileUrl: string;
  settingsUrl: string;
};

export function UserInfo({ user, onSignOut, profileUrl, settingsUrl }: UserInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="cursor-pointer rounded align-middle ring-[#0B2D6B] ring-offset-2 outline-none focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          {user?.image ? (
            <Image
              src={user.image}
              className="size-10 overflow-hidden rounded-full object-cover"
              alt={`Avatar of ${user.name}`}
              role="presentation"
              width={200}
              height={200}
            />
          ) : (
            <UserAvatar name={user.name} />
          )}
          <figcaption className="flex items-center gap-1 font-semibold text-dark max-[1024px]:sr-only dark:text-dark-6 text-sm">
            <span className="max-w-24 truncate">{user.name}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "size-4 rotate-180 transition-transform text-gray-500",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-xl min-[230px]:min-w-64 dark:border-dark-3 dark:bg-gray-dark rounded-xl"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          {user?.image ? (
            <Image
              src={user.image}
              className="size-12 shrink-0 overflow-hidden rounded-full object-cover object-center"
              alt={`Avatar of ${user.name}`}
              role="presentation"
              width={48}
              height={48}
            />
          ) : (
            <UserAvatar name={user.name} />
          )}

          <figcaption className="space-y-1 text-sm font-semibold">
            <div className="mb-1 leading-none text-dark dark:text-white flex items-center gap-1.5">
              <span>{user.name}</span>
              {user.role === "admin" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Admin
                </span>
              )}
            </div>

            <div className="w-full max-w-47.5 truncate leading-none text-gray-500 text-xs font-normal">
              {user.email}
            </div>
          </figcaption>
        </figure>

        <hr className="border-gray-100 dark:border-dark-3" />

        <div className="p-2 text-sm text-[#4B5563] *:cursor-pointer dark:text-dark-6">
          <Link
            href={profileUrl}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 ring-[#0B2D6B] outline-0 hover:bg-gray-50 hover:text-dark focus-visible:ring-1 dark:hover:bg-dark-3 dark:hover:text-white font-medium"
          >
            <UserIcon className="size-4" />

            <span className="mr-auto text-xs font-semibold">View profile</span>
          </Link>

          <Link
            href={settingsUrl}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 ring-[#0B2D6B] outline-0 hover:bg-gray-50 hover:text-dark focus-visible:ring-1 dark:hover:bg-dark-3 dark:hover:text-white font-medium"
          >
            <SettingsIcon className="size-4" />

            <span className="mr-auto text-xs font-semibold">
              Account Settings
            </span>
          </Link>
        </div>

        <hr className="border-gray-100 dark:border-dark-3" />

        <div className="p-2 text-sm text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 ring-red-500 outline-0 hover:bg-red-50 hover:text-red-700 focus-visible:ring-1 dark:hover:bg-red-950/20 dark:hover:text-red-400"
            onClick={() => {
              setIsOpen(false);
              onSignOut();
            }}
          >
            <LogOutIcon className="size-4 text-red-500" />

            <span className="text-xs font-semibold">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  return (
    <span className="flex size-10 items-center justify-center rounded-full border border-gray-100 bg-[#0B2D6B]/5 text-[#0B2D6B] font-bold text-xs outline-none dark:border-dark-4 dark:bg-dark-2 dark:text-white">
      {initial}
    </span>
  );
}
