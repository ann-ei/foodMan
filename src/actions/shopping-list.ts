"use server";

import { db } from "@/lib/db";
import { getRequiredUser } from "@/lib/auth-utils";
import { shoppingItemInput, type ShoppingItemInput } from "@/lib/validations";
import { addMissingToShoppingList } from "@/lib/services/shopping-list";
import { revalidatePath } from "next/cache";

export async function addShoppingItem(data: ShoppingItemInput) {
  const user = await getRequiredUser();
  const parsed = shoppingItemInput.parse(data);

  const item = await db.shoppingListItem.create({
    data: {
      userId: user.id,
      name: parsed.name,
      quantity: parsed.quantity ?? null,
      unit: parsed.unit || null,
    },
  });

  revalidatePath("/shopping-list");
  return item;
}

export async function togglePurchased(id: string) {
  const user = await getRequiredUser();
  const item = await db.shoppingListItem.findFirst({ where: { id, userId: user.id } });
  if (!item) throw new Error("Item not found");

  await db.shoppingListItem.update({
    where: { id },
    data: { isPurchased: !item.isPurchased },
  });

  revalidatePath("/shopping-list");
}

export async function deleteShoppingItem(id: string) {
  const user = await getRequiredUser();
  await db.shoppingListItem.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/shopping-list");
}

export async function clearPurchased() {
  const user = await getRequiredUser();
  await db.shoppingListItem.deleteMany({ where: { isPurchased: true, userId: user.id } });
  revalidatePath("/shopping-list");
}

export async function addMissingIngredientsToList(ingredients: string[]) {
  const user = await getRequiredUser();
  await addMissingToShoppingList(user.id, ingredients);
  revalidatePath("/shopping-list");
}
