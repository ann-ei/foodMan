"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deletePantryItem } from "@/actions/pantry";
import { daysUntil } from "@/lib/utils";
import type { PantryItemWithIngredient } from "@/types";

export function PantryItemRow({ item }: { item: PantryItemWithIngredient }) {
  const daysLeft = item.expirationDate ? daysUntil(item.expirationDate) : null;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-medium capitalize">{item.ingredient.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.quantity && `${item.quantity}`}
            {item.unit && ` ${item.unit}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {daysLeft !== null && (
          <Badge
            variant={daysLeft <= 0 ? "destructive" : daysLeft <= 3 ? "warning" : "success"}
          >
            {daysLeft <= 0 ? "Expired" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deletePantryItem(item.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
