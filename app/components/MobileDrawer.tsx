"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  X,
  Home,
  Rss,
  Users2,
  Users,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/#feed", label: "Feed", icon: Rss },
  { href: "/groups", label: "Groups", icon: Users2 },
  { href: "/network", label: "Network", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] lg:hidden">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 flex w-[82%] max-w-sm animate-drawer-in flex-col bg-[color:var(--bg)] shadow-soft">
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
              <Sparkles size={15} />
            </span>
            <span className="font-semibold text-ink">Menu</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-black/5 dark:hover:bg-white/10 focus-ring"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition",
                  active
                    ? "bg-primary-50 text-primary-700 dark:bg-primary/15 dark:text-primary-100"
                    : "text-ink-soft hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                )}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">Appearance</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-red-500 transition hover:bg-red-500/10"
          >
            <LogOut size={19} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}