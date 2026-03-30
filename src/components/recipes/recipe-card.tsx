"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, ChefHat, ShoppingCart, Clock, Loader2, Check } from "lucide-react";
import { markAsCooked, toggleFavorite } from "@/actions/recipes";
import { addMissingIngredientsToList } from "@/actions/shopping-list";
import type { RecipeMatch } from "@/types";
import { formatDate } from "@/lib/utils";

export function RecipeCard({ match }: { match: RecipeMatch }) {
  const { recipe, matchScore, missingIngredients, lastCooked } = match;
  const router = useRouter();
  const [isFav, setIsFav] = useState(recipe.isFavorite);
  const [cookPending, startCook] = useTransition();
  const [favPending, startFav] = useTransition();
  const [shopPending, startShop] = useTransition();
  const [shopSuccess, setShopSuccess] = useState(false);

  useEffect(() => {
    if (!shopSuccess) return;
    const timer = setTimeout(() => setShopSuccess(false), 2500);
    return () => clearTimeout(timer);
  }, [shopSuccess]);

  const matchColor =
    matchScore >= 80 ? "text-(--color-match-high)" : matchScore >= 50 ? "text-(--color-match-mid)" : "text-(--color-match-low)";

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("[role='button']")) return;
    router.push(`/recipes/${recipe.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative" onClick={handleCardClick}>
      <div className="relative">
        {recipe.imageUrl ? (
          <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${recipe.imageUrl})` }} />
        ) : (
          <div className="h-40 bg-gradient-to-br from-(--color-placeholder-from) to-(--color-placeholder-to) flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-(--color-placeholder-icon)" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={matchScore >= 80 ? "success" : matchScore >= 50 ? "warning" : "destructive"}>
            {matchScore}% match
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {recipe.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {recipe.categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="capitalize text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">{recipe.title}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFav(!isFav);
              startFav(() => toggleFavorite(recipe.id));
            }}
            disabled={favPending}
            className="shrink-0 mt-0.5"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground/50 hover:text-red-400"}`}
            />
          </button>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <Progress value={matchScore} className="h-2" />
            <span className={`text-sm font-medium ${matchColor}`}>{matchScore}%</span>
          </div>

          {missingIngredients.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {missingIngredients.slice(0, 3).map((ing) => (
                <Badge key={ing} variant="outline" className="text-xs">
                  {ing}
                </Badge>
              ))}
              {missingIngredients.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{missingIngredients.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {lastCooked && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last cooked: {formatDate(lastCooked)}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          size="sm"
          className="flex-1"
          disabled={cookPending}
          onClick={(e) => { e.stopPropagation(); startCook(() => markAsCooked(recipe.id)); }}
        >
          {cookPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ChefHat className="h-4 w-4 mr-1" />}
          Cook
        </Button>
        {missingIngredients.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={shopPending}
            onClick={(e) => {
              e.stopPropagation();
              startShop(async () => {
                await addMissingIngredientsToList(missingIngredients);
                setShopSuccess(true);
              });
            }}
          >
            {shopPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ShoppingCart className="h-4 w-4 mr-1" />}
            Add missing
          </Button>
        )}
      </CardFooter>

      {/* Success toast */}
      {shopSuccess && (
        <div className="absolute bottom-16 left-3 right-3 bg-(--color-feedback-bg) text-(--color-feedback-text) text-xs rounded-lg p-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 font-medium">
            <Check className="h-4 w-4" />
            Added to shopping list
          </div>
          <div className="mt-1 text-muted-foreground">
            {missingIngredients.slice(0, 3).join(", ")}
            {missingIngredients.length > 3 && ` +${missingIngredients.length - 3} more`}
          </div>
        </div>
      )}
    </Card>
  );
}
