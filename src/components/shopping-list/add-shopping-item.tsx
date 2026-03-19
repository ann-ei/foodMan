"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { addShoppingItem } from "@/actions/shopping-list";

export function AddShoppingItem() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await addShoppingItem({ name });
      setName("");
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        className="flex-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add item..."
      />
      <Button type="submit" disabled={loading || !name.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
        Add
      </Button>
    </form>
  );
}
