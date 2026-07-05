import { Sparkles } from "lucide-react";

interface PostAuthor {
  name: string | null;
  image: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string | Date;
  author: PostAuthor;
}

function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return d.toLocaleDateString();
}

export default function PostCard({ post }: { post: Post }) {
  const initial = post.author.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <article className="surface-card rounded-xl3 border border-ink/10 p-5 shadow-softer transition-shadow hover:shadow-lift">
      <div className="flex items-center gap-3">
        {post.author.image ? (
          <img
            src={post.author.image}
            alt={post.author.name ?? "User"}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {post.author.name ?? "Anonymous"}
          </p>
          <p className="text-xs text-ink-soft">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      <h3 className="mt-4 text-base font-semibold text-ink">{post.title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">
        {post.content}
      </p>

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              <Sparkles size={11} />
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}