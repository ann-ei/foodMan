import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { RecipeForm } from "@/components/recipes/recipe-form";
import type { RecipeWithIngredients } from "@/types";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const recipe = await db.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { include: { ingredient: true } },
    },
  });

  if (!recipe) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Recipe</h1>
      <RecipeForm recipe={recipe as RecipeWithIngredients} />
    </div>
  );
}
