"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { addPantryItem } from "@/actions/pantry";

export function PantryForm() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiration, setExpiration] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await addPantryItem({
        ingredientName: name,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit: unit || undefined,
        expirationDate: expiration || undefined,
      });
      setName("");
      setQuantity("");
      setUnit("");
      setExpiration("");
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end p-4 bg-card border rounded-lg">
      <div className="flex-1 min-w-[150px]">
        <Label htmlFor="name">Ingredient *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken breast" />
      </div>
      <div className="w-24">
        <Label htmlFor="qty">Quantity</Label>
        <Input id="qty" type="number" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>
      <div className="w-24">
        <Label htmlFor="unit">Unit</Label>
        <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="cups" />
      </div>
      <div className="w-40">
        <Label htmlFor="exp">Expires</Label>
        <Input id="exp" type="date" value={expiration} onChange={(e) => setExpiration(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading || !name.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
        Add
      </Button>
    </form>
  );
}
