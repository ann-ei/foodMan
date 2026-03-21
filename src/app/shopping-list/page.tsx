import { db } from "@/lib/db";
import { getRequiredUser } from "@/lib/auth-utils";
import { ShoppingItemRow } from "@/components/shopping-list/shopping-item-row";
import { AddShoppingItem } from "@/components/shopping-list/add-shopping-item";
import { Button } from "@/components/ui/button";
import { clearPurchased } from "@/actions/shopping-list";
import { Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShoppingListPage() {
  const user = await getRequiredUser();

  const items = await db.shoppingListItem.findMany({
    where: { userId: user.id },
    orderBy: [{ isPurchased: "asc" }, { createdAt: "desc" }],
  });

  const unpurchased = items.filter((i) => !i.isPurchased);
  const purchased = items.filter((i) => i.isPurchased);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shopping List</h1>
          <p className="text-sm text-muted-foreground">
            {unpurchased.length} items to buy{purchased.length > 0 && ` · ${purchased.length} purchased`}
          </p>
        </div>
        {purchased.length > 0 && (
          <form action={clearPurchased}>
            <Button variant="outline" size="sm" type="submit">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear purchased
            </Button>
          </form>
        )}
      </div>

      <AddShoppingItem />

      {items.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-6xl">🛒</p>
          <h2 className="text-xl font-semibold">Shopping list is empty</h2>
          <p className="text-muted-foreground">
            Add items manually or generate from your meal plan.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {unpurchased.map((item) => (
            <ShoppingItemRow key={item.id} item={item} />
          ))}
          {purchased.length > 0 && (
            <>
              <p className="text-sm font-medium text-muted-foreground pt-4">Purchased</p>
              {purchased.map((item) => (
                <ShoppingItemRow key={item.id} item={item} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
