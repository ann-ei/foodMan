"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { togglePurchased, deleteShoppingItem } from "@/actions/shopping-list";
import type { ShoppingListItem } from "@/types";

export function ShoppingItemRow({ item }: { item: ShoppingListItem }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={item.isPurchased}
          onCheckedChange={() => togglePurchased(item.id)}
        />
        <span className={`capitalize ${item.isPurchased ? "line-through text-muted-foreground" : ""}`}>
          {item.name}
          {item.quantity && ` (${item.quantity}${item.unit ? ` ${item.unit}` : ""})`}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => deleteShoppingItem(item.id)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
