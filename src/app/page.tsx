import { Suspense } from "react";
import { SuggestionSection } from "@/components/home/suggestion-section";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { getAllSuggestions, getRecipeMatches } from "@/lib/services/matching";
import { getRequiredUser } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChefHat } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function TopMatches() {
  const user = await getRequiredUser();
  const matches = await getRecipeMatches(user.id);

  const top3 = [...matches]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  if (top3.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-center text-muted-foreground text-sm">
        Based on what&apos;s in your pantry
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {top3.map((match) => (
          <RecipeCard key={match.recipe.id} match={match} />
        ))}
      </div>
    </div>
  );
}

async function Suggestions() {
  const user = await getRequiredUser();
  const { cookNow, rediscover, expiring } = await getAllSuggestions(user.id);
  const hasAnySuggestions = cookNow.length > 0 || rediscover.length > 0 || expiring.length > 0;

  if (!hasAnySuggestions) return null;

  return (
    <>
      <SuggestionSection
        title="Cook Now"
        icon="🍳"
        description="Recipes you can make with what you have"
        matches={cookNow}
      />

      <SuggestionSection
        title="Rediscover"
        icon="🕒"
        description="Recipes you haven't cooked in a while"
        matches={rediscover}
      />

      <SuggestionSection
        title="Use Before It Expires"
        icon="🥕"
        description="Cook these before your ingredients go bad"
        matches={expiring}
      />
    </>
  );
}

function SuggestionsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((j) => (
          <div key={j} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center pt-8 md:pt-16 pb-4 space-y-3">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-green-900 via-primary to-emerald-400 dark:from-emerald-200 dark:via-primary dark:to-green-400 bg-clip-text text-transparent">
          Hey, what are you hungry for today?
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your smart cooking assistant. Let&apos;s find something delicious.
        </p>
      </div>

      {/* Top 3 matches + Suggestions */}
      <Suspense fallback={<SuggestionsSkeleton />}>
        <TopMatches />
        <Suggestions />
      </Suspense>

      {/* Create recipe CTA */}
      <Link href="/recipes/new" className="block">
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-6 sm:p-8">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/15 shrink-0">
              <ChefHat className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-semibold">Create your own recipe</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Add a new recipe manually, paste text, or import from a URL.
              </p>
            </div>
            <Button size="lg" className="gap-2 pointer-events-none">
              <Plus className="h-4 w-4" />
              New Recipe
            </Button>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
