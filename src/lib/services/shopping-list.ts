import { db } from "@/lib/db";

export async function addMissingToShoppingList(missingIngredients: string[]) {
  const existing = await db.shoppingListItem.findMany({
    where: { isPurchased: false },
  });

  const existingNames = new Set(existing.map((i) => i.name.toLowerCase()));
  const toAdd = missingIngredients.filter(
    (name) => !existingNames.has(name.toLowerCase())
  );

  if (toAdd.length === 0) return [];

  return db.shoppingListItem.createMany({
    data: toAdd.map((name) => ({ name })),
  });
}

export async function generateShoppingListFromMealPlan(
  startDate: Date,
  endDate: Date
) {
  const mealPlans = await db.mealPlan.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    include: {
      recipe: {
        include: { ingredients: { include: { ingredient: true } } },
      },
    },
  });

  // Collect all needed ingredients
  const needed = new Map<string, { quantity: number; unit: string }>();
  for (const plan of mealPlans) {
    for (const ri of plan.recipe.ingredients) {
      const name = ri.ingredient.name.toLowerCase();
      const existing = needed.get(name);
      if (existing && ri.quantity) {
        existing.quantity += ri.quantity;
      } else {
        needed.set(name, {
          quantity: ri.quantity || 1,
          unit: ri.unit || "",
        });
      }
    }
  }

  // Subtract pantry items
  const pantry = await db.pantryItem.findMany({
    include: { ingredient: true },
  });

  for (const item of pantry) {
    const name = item.ingredient.name.toLowerCase();
    if (needed.has(name) && item.quantity) {
      const n = needed.get(name)!;
      n.quantity = Math.max(0, n.quantity - item.quantity);
      if (n.quantity === 0) needed.delete(name);
    }
  }

  // Clear existing unpurchased items and create new ones
  await db.shoppingListItem.deleteMany({ where: { isPurchased: false } });

  const items = Array.from(needed.entries()).map(([name, { quantity, unit }]) => ({
    name,
    quantity,
    unit: unit || undefined,
  }));

  if (items.length > 0) {
    await db.shoppingListItem.createMany({ data: items });
  }

  return items;
}
