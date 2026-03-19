"use server";

import { db } from "@/lib/db";
import { mealPlanInput, type MealPlanInput } from "@/lib/validations";
import { generateShoppingListFromMealPlan } from "@/lib/services/shopping-list";
import { revalidatePath } from "next/cache";

export async function addMealPlan(data: MealPlanInput) {
  const parsed = mealPlanInput.parse(data);

  const plan = await db.mealPlan.create({
    data: {
      date: new Date(parsed.date),
      mealType: parsed.mealType,
      recipeId: parsed.recipeId,
    },
  });

  revalidatePath("/meal-planner");
  return plan;
}

export async function removeMealPlan(id: string) {
  await db.mealPlan.delete({ where: { id } });
  revalidatePath("/meal-planner");
}

export async function generateShoppingList(startDate: string, endDate: string) {
  const items = await generateShoppingListFromMealPlan(
    new Date(startDate),
    new Date(endDate)
  );
  revalidatePath("/shopping-list");
  return items;
}
