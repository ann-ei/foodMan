"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/actions/recipes";

export function FavoriteButton({ recipeId, initialFavorite }: { recipeId: string; initialFavorite: boolean }) {
  const [isFav, setIsFav] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() => {
        setIsFav(!isFav);
        startTransition(() => toggleFavorite(recipeId));
      }}
    >
      <Heart className={`h-6 w-6 transition-colors ${isFav ? "fill-red-500 text-red-500" : "hover:text-red-300"}`} />
    </Button>
  );
}
