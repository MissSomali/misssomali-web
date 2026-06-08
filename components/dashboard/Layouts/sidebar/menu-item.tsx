import { cn } from "../../utils";
import Link from "next/link";
import { useSidebarContext } from "./sidebar-context";

export function MenuItem(
  props: {
    className?: string;
    children: React.ReactNode;
    isActive: boolean;
  } & ({ as?: "button"; onClick: () => void } | { as: "link"; href: string }),
) {
  const { toggleSidebar, isMobile } = useSidebarContext();
  
  const baseClass = "rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6";
  const activeClass = props.isActive 
    ? "bg-[rgba(87,80,241,0.07)] text-primary hover:bg-[rgba(87,80,241,0.07)] dark:bg-[#FFFFFF1A] dark:text-white"
    : "hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-white";

  if (props.as === "link") {
    return (
      <Link
        href={props.href}
        // Close sidebar on clicking link if it's mobile
        onClick={() => isMobile && toggleSidebar()}
        className={cn(
          baseClass,
          activeClass,
          "relative block py-2",
          props.className,
        )}
      >
        {props.children}
      </Link>
    );
  }

  return (
    <button
      onClick={props.onClick}
      aria-expanded={props.isActive}
      className={cn(
        baseClass,
        activeClass,
        "flex w-full items-center gap-3 py-3",
        props.className,
      )}
    >
      {props.children}
    </button>
  );
}
