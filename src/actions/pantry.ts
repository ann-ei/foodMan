"use server";

import { db } from "@/lib/db";
import { pantryItemInput, type PantryItemInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function addPantryItem(data: PantryItemInput) {
  const parsed = pantryItemInput.parse(data);

  const ingredient = await db.ingredient.upsert({
    where: { name: parsed.ingredientName.toLowerCase().trim() },
    update: {},
    create: { name: parsed.ingredientName.toLowerCase().trim() },
  });

  const item = await db.pantryItem.create({
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

export async function updatePantryItem(id: string, data: PantryItemInput) {
  const parsed = pantryItemInput.parse(data);

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
  await db.pantryItem.delete({ where: { id } });
  revalidatePath("/pantry");
  revalidatePath("/");
}
