"use server";

import { db } from "@/lib/db";
import { getRequiredUser } from "@/lib/auth-utils";
import { mealPlanInput, type MealPlanInput } from "@/lib/validations";
import { generateShoppingListFromMealPlan } from "@/lib/services/shopping-list";
import { revalidatePath } from "next/cache";

export async function addMealPlan(data: MealPlanInput) {
  const user = await getRequiredUser();
  const parsed = mealPlanInput.parse(data);

  const plan = await db.mealPlan.create({
    data: {
      userId: user.id,
      date: new Date(parsed.date),
      mealType: parsed.mealType,
      recipeId: parsed.recipeId,
    },
  });

  revalidatePath("/meal-planner");
  return plan;
}

export async function removeMealPlan(id: string) {
  const user = await getRequiredUser();
  await db.mealPlan.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/meal-planner");
}

export async function previewShoppingList(startDate: string, endDate: string) {
  const user = await getRequiredUser();
  const { previewShoppingListFromMealPlan } = await import("@/lib/services/shopping-list");
  return previewShoppingListFromMealPlan(user.id, new Date(startDate), new Date(endDate));
}

export async function generateShoppingList(startDate: string, endDate: string) {
  const user = await getRequiredUser();
  const items = await generateShoppingListFromMealPlan(
    user.id,
    new Date(startDate),
    new Date(endDate)
  );
  revalidatePath("/shopping-list");
  return items;
}
