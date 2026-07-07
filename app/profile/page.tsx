"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Camera, MapPin, Pencil, GraduationCap } from "lucide-react";
import PostCard from "@/app/components/ui/PostCard";
import Button from "@/app/components/ui/Button";

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  author: { name: string | null; image: string | null };
}

interface Profile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  course: string | null;
  year: string | null;
  university: string | null;
  skills: string[];
  interests: string[];
  _count: { posts: number };
}

const tabs = ["Posts", "Skills", "About"] as const;
type Tab = (typeof tabs)[number];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("Posts");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/posts"),
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (postsRes.ok) {
          const allPosts: Post[] = await postsRes.json();
          setMyPosts(
            allPosts.filter((p) => session?.user?.id && (p as any).authorId === session.user.id)
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (session?.user?.id) load();
  }, [session?.user?.id]);

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-ink-soft">Loading profile…</div>;
  }

  if (!profile) {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-ink-soft">Couldn&apos;t load profile.</div>;
  }

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-4">
            {profile.image ? (
              <img src={profile.image} alt={profile.name ?? "User"} className="h-28 w-28 rounded-full object-cover shadow-softer sm:h-32 sm:w-32" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-3xl font-semibold text-primary sm:h-32 sm:w-32">
                {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="mt-3 text-center sm:mt-0 sm:pb-1 sm:text-left">
              <h1 className="text-xl font-semibold text-ink">{profile.name ?? "Unnamed"}</h1>
              <p className="text-sm text-ink-soft">{profile.email}</p>
            </div>
          </div>
          <Button className="mt-4 sm:mt-0" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil size={14} /> Edit Profile
          </Button>
        </div>

        <div className="mt-5 flex flex-col items-center gap-1.5 text-center sm:items-start sm:text-left">
          {profile.bio && <p className="max-w-xl text-sm text-ink-soft">{profile.bio}</p>}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-soft sm:justify-start">
            {(profile.course || profile.year) && (
              <span className="flex items-center gap-1">
                <GraduationCap size={13} /> {[profile.course, profile.year].filter(Boolean).join(" · ")}
              </span>
            )}
            {profile.university && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {profile.university}
              </span>
            )}
          </div>
        </div>

        {profile.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {profile.skills.map((s) => (
              <span key={s} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl3 border border-ink/10 p-4 sm:max-w-xs">
          <div className="text-center">
            <p className="text-lg font-semibold text-ink">{profile._count.posts}</p>
            <p className="text-xs text-ink-soft">Posts</p>
          </div>
        </div>

        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-ink/10">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === t ? "border-primary text-primary" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "Posts" && (
            <div className="mx-auto max-w-2xl space-y-5">
              {myPosts.length === 0 ? (
                <p className="text-center text-sm text-ink-soft">You haven&apos;t posted anything yet.</p>
              ) : (
                myPosts.map((p) => <PostCard key={p.id} post={p} />)
              )}
            </div>
          )}

          {tab === "Skills" && (
            <div className="flex flex-wrap gap-2">
              {profile.skills.length === 0 ? (
                <p className="text-sm text-ink-soft">No skills added yet.</p>
              ) : (
                profile.skills.map((s) => (
                  <span key={s} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink">
                    {s}
                  </span>
                ))
              )}
            </div>
          )}

          {tab === "About" && (
            <div className="max-w-xl space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium text-ink-soft">Bio</p>
                <p className="mt-1 text-ink">{profile.bio || "No bio added yet."}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-soft">Interests</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile.interests.length === 0 ? (
                    <p className="text-sm text-ink-soft">No interests added yet.</p>
                  ) : (
                    profile.interests.map((i) => (
                      <span key={i} className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink-soft">
                        {i}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSaved={(updated) => setProfile(updated)}
      />
    </div>
  );
}

function EditProfileModal({
  open,
  onClose,
  profile,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  onSaved: (updated: Profile) => void;
}) {
  const [bio, setBio] = useState(profile.bio ?? "");
  const [course, setCourse] = useState(profile.course ?? "");
  const [year, setYear] = useState(profile.year ?? "");
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [interests, setInterests] = useState(profile.interests.join(", "));
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, course, year, skills, interests }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSaved({ ...profile, ...updated });
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-lift sm:rounded-xl3">
        <h2 className="text-lg font-semibold text-ink">Edit profile</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full resize-none rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">Course</label>
              <input value={course} onChange={(e) => setCourse(e.target.value)}
                className="h-10 w-full rounded-lg border border-ink/15 px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">Year</label>
              <input value={year} onChange={(e) => setYear(e.target.value)}
                className="h-10 w-full rounded-lg border border-ink/15 px-3 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Skills (comma separated)</label>
            <input value={skills} onChange={(e) => setSkills(e.target.value)}
              className="h-10 w-full rounded-lg border border-ink/15 px-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Interests (comma separated)</label>
            <input value={interests} onChange={(e) => setInterests(e.target.value)}
              className="h-10 w-full rounded-lg border border-ink/15 px-3 text-sm outline-none focus:border-primary" />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-ink/10 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </div>
    </div>
  );
}