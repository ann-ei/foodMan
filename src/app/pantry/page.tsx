import { db } from "@/lib/db";
import { getRequiredUser } from "@/lib/auth-utils";
import { PantryForm } from "@/components/pantry/pantry-form";
import { PantryItemRow } from "@/components/pantry/pantry-item-row";
import type { PantryItemWithIngredient } from "@/types";

export const dynamic = "force-dynamic";

export default async function PantryPage() {
  const user = await getRequiredUser();

  const items = await db.pantryItem.findMany({
    where: { userId: user.id },
    include: { ingredient: true },
    orderBy: [
      { expirationDate: "asc" },
      { ingredient: { name: "asc" } },
    ],
  });

  const expiringSoon = items.filter(
    (i) => i.expirationDate && new Date(i.expirationDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pantry</h1>
        <p className="text-sm text-muted-foreground">
          {items.length} items{expiringSoon.length > 0 && ` · ${expiringSoon.length} expiring soon`}
        </p>
      </div>

      <PantryForm />

      {items.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-6xl">🥬</p>
          <h2 className="text-xl font-semibold">Your pantry is empty</h2>
          <p className="text-muted-foreground">Add ingredients to get smart recipe suggestions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <PantryItemRow key={item.id} item={item as PantryItemWithIngredient} />
          ))}
        </div>
      )}
    </div>
  );
}
