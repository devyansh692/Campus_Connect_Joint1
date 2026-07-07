"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Plus, SlidersHorizontal, ChevronRight, LogOut } from "lucide-react";
import PostCard from "@/app/components/ui/PostCard";
import CreatePostModal from "@/app/components/ui/CreatePostModal";
import Chip from "@/app/components/ui/Chip";
import { PostSkeleton } from "@/app/components/ui/Skeleton";
import Button from "@/app/components/ui/Button";

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  author: { name: string | null; image: string | null };
}

interface ProfileSummary {
  name: string | null;
  image: string | null;
  course: string | null;
  _count: { posts: number };
}

const filters = ["All", "Hackathon", "Capstone", "Robotics", "Content", "Startup"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAllPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) setProfile(await res.json());
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, [session?.user?.id]);

  const filteredPosts = useMemo(() => {
    if (activeFilter === "All") return allPosts;
    return allPosts.filter((p) =>
      p.tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()))
    );
  }, [activeFilter, allPosts]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((c) => c + 3);
      setLoadingMore(false);
    }, 700);
  };

  const handlePostCreated = (newPost: Post) => {
    setAllPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      {/* Profile snapshot */}
      <Link
        href="/profile"
        className="surface-card mb-6 flex items-center justify-between rounded-xl3 border border-ink/10 p-4 shadow-softer transition hover:shadow-lift"
      >
        <div className="flex min-w-0 items-center gap-3">
          {profile?.image ? (
            <img
              src={profile.image}
              alt={profile.name ?? "You"}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {(profile?.name ?? session?.user?.name)?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {profile?.name ?? session?.user?.name ?? "Your profile"}
            </p>
            <p className="truncate text-xs text-ink-soft">
              {profile?.course ?? "Complete your profile"}
              {profile?._count?.posts != null && ` · ${profile._count.posts} posts`}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="shrink-0 text-ink-soft" />
      </Link>

      <section className="aurora surface-card mb-8 rounded-xl3 p-6 shadow-softer sm:p-8">
        <p className="stamp text-xs font-semibold uppercase tracking-widest text-primary">
          Campus Feed
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Find your next teammate, club, or collaborator.
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-soft">
          Real requests from real students across campuses — post what you need,
          or offer what you know.
        </p>
        <div className="mt-5 hidden items-center gap-2 sm:flex">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Create post
          </Button>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </section>

      <div id="feed" className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scroll-pl-1">
        <span className="flex shrink-0 items-center gap-1 text-ink-soft">
          <SlidersHorizontal size={14} />
        </span>
        {filters.map((f) => (
          <Chip key={f} selected={activeFilter === f} onClick={() => { setActiveFilter(f); setVisibleCount(3); }}>
            {f}
          </Chip>
        ))}
      </div>

      <div className="space-y-5">
        {loading && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}
        {!loading && visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {loadingMore && <PostSkeleton />}
      </div>

      {!loading && !hasMore && visiblePosts.length > 0 && (
        <p className="mt-8 text-center text-sm text-ink-soft">
          You&apos;re all caught up — that&apos;s every post in this category.
        </p>
      )}

      {!loading && hasMore && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more posts"}
          </Button>
        </div>
      )}

      {!loading && visiblePosts.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="text-sm font-medium text-ink">No posts match this filter yet</p>
          <p className="mt-1 text-sm text-ink-soft">Be the first to post in this category.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Create post
          </Button>
        </div>
      )}

      <button
        onClick={() => setCreateOpen(true)}
        aria-label="Create post"
        className="fixed bottom-6 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lift transition-transform hover:scale-105 active:scale-95 sm:hidden"
      >
        <Plus size={24} />
      </button>

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}