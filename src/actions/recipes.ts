"use server";

import { db } from "@/lib/db";
import { getRequiredUser } from "@/lib/auth-utils";
import { recipeInput, type RecipeInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createRecipe(data: RecipeInput) {
  const user = await getRequiredUser();
  const parsed = recipeInput.parse(data);

  const recipe = await db.recipe.create({
    data: {
      userId: user.id,
      title: parsed.title,
      description: parsed.description || null,
      instructions: parsed.instructions || null,
      imageUrl: parsed.imageUrl || null,
      sourceUrl: parsed.sourceUrl || null,
      categories: parsed.categories || [],
      prepTime: parsed.prepTime ?? null,
      cookTime: parsed.cookTime ?? null,
      servings: parsed.servings ?? null,
      ingredients: {
        create: await Promise.all(
          parsed.ingredients.map(async (ing) => {
            const ingredient = await db.ingredient.upsert({
              where: { name: ing.name.toLowerCase().trim() },
              update: {},
              create: { name: ing.name.toLowerCase().trim() },
            });
            return {
              quantity: ing.quantity ?? null,
              unit: ing.unit || null,
              notes: ing.notes || null,
              ingredientId: ingredient.id,
            };
          })
        ),
      },
    },
  });

  revalidatePath("/recipes");
  revalidatePath("/");
  return recipe;
}

export async function updateRecipe(id: string, data: RecipeInput) {
  const user = await getRequiredUser();
  const parsed = recipeInput.parse(data);

  const existing = await db.recipe.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Recipe not found");

  await db.recipeIngredient.deleteMany({ where: { recipeId: id } });

  const recipe = await db.recipe.update({
    where: { id },
    data: {
      title: parsed.title,
      description: parsed.description || null,
      instructions: parsed.instructions || null,
      imageUrl: parsed.imageUrl || null,
      sourceUrl: parsed.sourceUrl || null,
      categories: parsed.categories || [],
      prepTime: parsed.prepTime ?? null,
      cookTime: parsed.cookTime ?? null,
      servings: parsed.servings ?? null,
      ingredients: {
        create: await Promise.all(
          parsed.ingredients.map(async (ing) => {
            const ingredient = await db.ingredient.upsert({
              where: { name: ing.name.toLowerCase().trim() },
              update: {},
              create: { name: ing.name.toLowerCase().trim() },
            });
            return {
              quantity: ing.quantity ?? null,
              unit: ing.unit || null,
              notes: ing.notes || null,
              ingredientId: ingredient.id,
            };
          })
        ),
      },
    },
  });

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${id}`);
  revalidatePath("/");
  return recipe;
}

export async function deleteRecipe(id: string) {
  const user = await getRequiredUser();
  const count = await db.recipe.deleteMany({ where: { id, userId: user.id } });
  if (count.count === 0) throw new Error("Recipe not found");
  revalidatePath("/recipes");
  revalidatePath("/");
}

export async function toggleFavorite(id: string) {
  const user = await getRequiredUser();
  const recipe = await db.recipe.findFirst({ where: { id, userId: user.id } });
  if (!recipe) throw new Error("Recipe not found");

  await db.recipe.update({
    where: { id },
    data: { isFavorite: !recipe.isFavorite },
  });

  revalidatePath("/recipes");
  revalidatePath("/");
}

export async function markAsCooked(recipeId: string) {
  const user = await getRequiredUser();
  const recipe = await db.recipe.findFirst({ where: { id: recipeId, userId: user.id } });
  if (!recipe) throw new Error("Recipe not found");

  await db.cookingHistory.create({
    data: { recipeId, userId: user.id },
  });
  revalidatePath("/recipes");
  revalidatePath("/");
}
