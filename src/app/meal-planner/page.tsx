import { db } from "@/lib/db";
import { MealPlannerView } from "@/components/meal-planner/meal-planner-view";
import type { MealPlanWithRecipe, RecipeWithIngredients } from "@/types";

export const dynamic = "force-dynamic";

export default async function MealPlannerPage() {
  const [mealPlans, recipes] = await Promise.all([
    db.mealPlan.findMany({
      include: {
        recipe: {
          include: { ingredients: { include: { ingredient: true } } },
        },
      },
      orderBy: { date: "asc" },
    }),
    db.recipe.findMany({
      include: { ingredients: { include: { ingredient: true } } },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meal Planner</h1>
        <p className="text-sm text-muted-foreground">Plan your meals for the week</p>
      </div>

      <MealPlannerView
        mealPlans={mealPlans as MealPlanWithRecipe[]}
        recipes={recipes as RecipeWithIngredients[]}
      />
    </div>
  );
}
