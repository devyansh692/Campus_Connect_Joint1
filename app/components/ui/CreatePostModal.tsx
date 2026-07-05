"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import Button from "@/app/components/ui/Button";

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  author: { name: string | null; image: string | null };
}

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export default function CreatePostModal({ open, onClose, onPostCreated }: CreatePostModalProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      setError("You must be logged in to post.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags: [],
          authorId: session.user.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to create post");

      const newPost = await res.json();
      onPostCreated(newPost);
      setTitle("");
      setContent("");
      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-lift sm:rounded-xl3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Create a post</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-ink-soft" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you looking for?"
            rows={4}
            className="w-full resize-none rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || !content || submitting}>
            {submitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}