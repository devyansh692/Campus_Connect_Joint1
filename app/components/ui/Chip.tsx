"use client";

import { cn } from "@/lib/utils";

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export default function Chip({ children, selected, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "border-primary bg-primary text-white"
          : "border-ink/15 text-ink-soft hover:bg-ink/5"
      )}
    >
      {children}
    </button>
  );
}