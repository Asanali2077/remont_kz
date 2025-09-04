"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/components/favorites/FavoritesProvider";

export function FavoriteButton({ id }: { id: number }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(id);
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className="gap-2"
      onClick={() => toggleFavorite(id)}
    >
      <Heart className={"h-4 w-4 " + (active ? "fill-current" : "")} />
      {active ? "В избранном" : "В избранное"}
    </Button>
  );
}


