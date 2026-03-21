import { getRecipeMatches } from "@/lib/services/matching";
import { getRequiredUser } from "@/lib/auth-utils";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const user = await getRequiredUser();
  const matches = await getRecipeMatches(user.id);

  // Sort by match score descending by default
  const sorted = [...matches].sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recipes</h1>
          <p className="text-sm text-muted-foreground">{sorted.length} recipes</p>
        </div>
        <Link href="/recipes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </Button>
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-6xl">📚</p>
          <h2 className="text-xl font-semibold">No recipes yet</h2>
          <p className="text-muted-foreground">Add your first recipe to get started.</p>
          <Link href="/recipes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((match) => (
            <RecipeCard key={match.recipe.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
