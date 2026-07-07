"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Rss,
  Users,
  Users2,
  Bell,
  Search,
  Menu,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import MobileDrawer from "./MobileDrawer";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/#feed", label: "Feed", icon: Rss },
  { href: "/groups", label: "Groups", icon: Users2 },
  { href: "/network", label: "Network", icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function fetchUnread() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setUnread(data.filter((n: { unread: boolean }) => n.unread).length);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUnread();
  }, [session?.user?.id]);

  const isAuthPage = pathname === "/login" || pathname === "/onboarding";
  if (isAuthPage) return null;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/network?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled ? "glass shadow-softer" : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-softer transition-transform duration-300 group-hover:scale-105">
              <Sparkles size={17} strokeWidth={2.4} />
            </span>
            <span className="hidden text-lg font-semibold tracking-tight text-ink sm:block">
              Campus<span className="text-primary">Connect</span>
            </span>
          </Link>

          {/* Search — desktop & tablet */}
          <form
            onSubmit={submitSearch}
            className="relative ml-2 hidden flex-1 max-w-md items-center md:flex"
          >
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 text-ink-soft"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search people, skills, universities…"
              className="h-10 w-full rounded-full border border-[color:var(--border)] bg-black/[0.025] pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft transition focus:border-primary/50 focus:bg-[color:var(--card)] focus:shadow-softer focus-ring dark:bg-white/[0.04]"
            />
          </form>

          <div className="flex-1 md:hidden" />

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary-50 text-primary-700 dark:bg-primary/15 dark:text-primary-100"
                      : "text-ink-soft hover:bg-black/[0.04] hover:text-ink dark:hover:bg-white/[0.06]"
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Tablet-only icon nav */}
          <nav className="hidden items-center gap-1 md:flex lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition",
                    active
                      ? "bg-primary-50 text-primary-700 dark:bg-primary/15 dark:text-primary-100"
                      : "text-ink-soft hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  )}
                >
                  <Icon size={17} />
                </Link>
              );
            })}
          </nav>

          {/* Mobile search icon */}
          <button
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-black/5 dark:hover:bg-white/10 md:hidden focus-ring"
            onClick={() => router.push("/network")}
          >
            <Search size={18} />
          </button>

          <ThemeToggle className="hidden sm:flex" />

          {/* Notifications */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-black/5 dark:hover:bg-white/10 focus-ring"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link href="/profile" aria-label="Profile" className="shrink-0">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "Profile"}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent transition hover:ring-primary/30"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-2 ring-transparent transition hover:ring-primary/30">
                {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
            )}
          </Link>

          {/* Hamburger — mobile only */}
          <button
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-black/5 dark:hover:bg-white/10 lg:hidden focus-ring"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}