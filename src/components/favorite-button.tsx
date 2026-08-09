"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  slug: string;
  className?: string;
  iconClassName?: string;
}

export function FavoriteButton({
  slug,
  className,
  iconClassName,
}: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(slug);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-1.5 text-white/70 transition-colors hover:text-red-500 cursor-pointer",
        active && "text-red-500",
        className
      )}
    >
      <Heart className={cn("size-5", active && "fill-current", iconClassName)} />
    </button>
  );
}
