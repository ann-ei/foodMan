"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, ChefHat, ShoppingCart, Clock } from "lucide-react";
import { markAsCooked, toggleFavorite } from "@/actions/recipes";
import { addMissingIngredientsToList } from "@/actions/shopping-list";
import type { RecipeMatch } from "@/types";
import { formatDate } from "@/lib/utils";

export function RecipeCard({ match }: { match: RecipeMatch }) {
  const { recipe, matchScore, missingIngredients, lastCooked } = match;

  const matchColor =
    matchScore >= 80 ? "text-green-600" : matchScore >= 50 ? "text-yellow-600" : "text-red-500";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {recipe.imageUrl ? (
          <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${recipe.imageUrl})` }} />
        ) : (
          <div className="h-40 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-green-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={matchScore >= 80 ? "success" : matchScore >= 50 ? "warning" : "destructive"}>
            {matchScore}% match
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">{recipe.title}</h3>
          <button
            onClick={() => toggleFavorite(recipe.id)}
            className="shrink-0 mt-0.5"
          >
            <Heart
              className={`h-5 w-5 ${recipe.isFavorite ? "fill-red-500 text-red-500" : "text-gray-300"}`}
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
          onClick={() => markAsCooked(recipe.id)}
        >
          <ChefHat className="h-4 w-4 mr-1" />
          Cook
        </Button>
        {missingIngredients.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => addMissingIngredientsToList(missingIngredients)}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add missing
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
