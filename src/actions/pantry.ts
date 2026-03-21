"use server";

import { db } from "@/lib/db";
import { getRequiredUser } from "@/lib/auth-utils";
import { pantryItemInput, type PantryItemInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function addPantryItem(data: PantryItemInput) {
  const user = await getRequiredUser();
  const parsed = pantryItemInput.parse(data);

  const ingredient = await db.ingredient.upsert({
    where: { name: parsed.ingredientName.toLowerCase().trim() },
    update: {},
    create: { name: parsed.ingredientName.toLowerCase().trim() },
  });

  const item = await db.pantryItem.create({
    data: {
      userId: user.id,
      ingredientId: ingredient.id,
      quantity: parsed.quantity ?? null,
      unit: parsed.unit || null,
      expirationDate: parsed.expirationDate ? new Date(parsed.expirationDate) : null,
    },
  });

  revalidatePath("/pantry");
  revalidatePath("/");
  return item;
}

export async function updatePantryItem(id: string, data: PantryItemInput) {
  const user = await getRequiredUser();
  const parsed = pantryItemInput.parse(data);

  const existing = await db.pantryItem.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Item not found");

  const ingredient = await db.ingredient.upsert({
    where: { name: parsed.ingredientName.toLowerCase().trim() },
    update: {},
    create: { name: parsed.ingredientName.toLowerCase().trim() },
  });

  const item = await db.pantryItem.update({
    where: { id },
    data: {
      ingredientId: ingredient.id,
      quantity: parsed.quantity ?? null,
      unit: parsed.unit || null,
      expirationDate: parsed.expirationDate ? new Date(parsed.expirationDate) : null,
    },
  });

  revalidatePath("/pantry");
  revalidatePath("/");
  return item;
}

export async function deletePantryItem(id: string) {
  const user = await getRequiredUser();
  const count = await db.pantryItem.deleteMany({ where: { id, userId: user.id } });
  if (count.count === 0) throw new Error("Item not found");
  revalidatePath("/pantry");
  revalidatePath("/");
}
