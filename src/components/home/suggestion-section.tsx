import { RecipeCard } from "@/components/recipes/recipe-card";
import type { RecipeMatch } from "@/types";

export function SuggestionSection({
  title,
  icon,
  description,
  matches,
}: {
  title: string;
  icon: string;
  description: string;
  matches: RecipeMatch[];
}) {
  if (matches.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => (
          <RecipeCard key={match.recipe.id} match={match} />
        ))}
      </div>
    </section>
  );
}
