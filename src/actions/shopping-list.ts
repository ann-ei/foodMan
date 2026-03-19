"use server";

import { db } from "@/lib/db";
import { shoppingItemInput, type ShoppingItemInput } from "@/lib/validations";
import { addMissingToShoppingList } from "@/lib/services/shopping-list";
import { revalidatePath } from "next/cache";

export async function addShoppingItem(data: ShoppingItemInput) {
  const parsed = shoppingItemInput.parse(data);

  const item = await db.shoppingListItem.create({
    data: {
      name: parsed.name,
      quantity: parsed.quantity ?? null,
      unit: parsed.unit || null,
    },
  });

  revalidatePath("/shopping-list");
  return item;
}

export async function togglePurchased(id: string) {
  const item = await db.shoppingListItem.findUnique({ where: { id } });
  if (!item) throw new Error("Item not found");

  await db.shoppingListItem.update({
    where: { id },
    data: { isPurchased: !item.isPurchased },
  });

  revalidatePath("/shopping-list");
}

export async function deleteShoppingItem(id: string) {
  await db.shoppingListItem.delete({ where: { id } });
  revalidatePath("/shopping-list");
}

export async function clearPurchased() {
  await db.shoppingListItem.deleteMany({ where: { isPurchased: true } });
  revalidatePath("/shopping-list");
}

export async function addMissingIngredientsToList(ingredients: string[]) {
  await addMissingToShoppingList(ingredients);
  revalidatePath("/shopping-list");
}
