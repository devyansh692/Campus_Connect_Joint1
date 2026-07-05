"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/app/components/ui/Button";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    // TODO: wire this to your API route once you have a Post model/endpoint
    console.log({ title, content });
    setTitle("");
    setContent("");
    onClose();
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
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || !content}>Post</Button>
        </div>
      </div>
    </div>
  );
}