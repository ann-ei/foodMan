"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Trash2, ShoppingCart, ChefHat, Loader2 } from "lucide-react";
import Link from "next/link";
import { addMealPlan, removeMealPlan, generateShoppingList, previewShoppingList } from "@/actions/meal-planner";
import { addDays, startOfWeek, format, isSameDay } from "date-fns";
import type { MealPlanWithRecipe, RecipeWithIngredients } from "@/types";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export function MealPlannerView({
  mealPlans,
  recipes,
}: {
  mealPlans: MealPlanWithRecipe[];
  recipes: RecipeWithIngredients[];
}) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showPreview, setShowPreview] = useState(false);
  const [previewItems, setPreviewItems] = useState<{ name: string; quantity: number; unit: string | null }[]>([]);
  const [previewPending, startPreview] = useTransition();
  const [confirmPending, startConfirm] = useTransition();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Pre-index meals by "date|mealType" key to avoid filtering the full array 28 times
  const mealIndex = useMemo(() => {
    const index = new Map<string, MealPlanWithRecipe[]>();
    for (const mp of mealPlans) {
      const key = `${format(new Date(mp.date), "yyyy-MM-dd")}|${mp.mealType}`;
      const arr = index.get(key) || [];
      arr.push(mp);
      index.set(key, arr);
    }
    return index;
  }, [mealPlans]);

  const getMealsForDay = (date: Date, mealType: string) =>
    mealIndex.get(`${format(date, "yyyy-MM-dd")}|${mealType}`) || [];

  const handleAdd = async (date: Date, mealType: string, recipeId: string) => {
    await addMealPlan({
      date: format(date, "yyyy-MM-dd"),
      mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      recipeId,
    });
  };

  const handlePreview = () => {
    const start = format(weekStart, "yyyy-MM-dd");
    const end = format(addDays(weekStart, 6), "yyyy-MM-dd");
    startPreview(async () => {
      const items = await previewShoppingList(start, end);
      setPreviewItems(items);
      setShowPreview(true);
    });
  };

  const handleConfirmGenerate = () => {
    const start = format(weekStart, "yyyy-MM-dd");
    const end = format(addDays(weekStart, 6), "yyyy-MM-dd");
    startConfirm(async () => {
      await generateShoppingList(start, end);
      setShowPreview(false);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={handlePreview} disabled={previewPending}>
          {previewPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
          Generate Shopping List
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {days.map((day) => (
          <Card key={day.toISOString()} className="min-h-[200px]">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm font-medium">
                <span className="block text-xs text-muted-foreground">{format(day, "EEE")}</span>
                {format(day, "MMM d")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {MEAL_TYPES.map((type) => {
                const meals = getMealsForDay(day, type);
                return (
                  <div key={type} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground capitalize">{type}</p>
                    {meals.map((meal) => (
                      <div key={meal.id} className="group relative rounded-md border bg-card overflow-hidden">
                        <Link href={`/recipes/${meal.recipe.id}`} className="block">
                          {meal.recipe.imageUrl ? (
                            <div
                              className="h-16 bg-cover bg-center"
                              style={{ backgroundImage: `url(${meal.recipe.imageUrl})` }}
                            />
                          ) : (
                            <div className="h-16 bg-gradient-to-br from-(--color-placeholder-from) to-(--color-placeholder-to) flex items-center justify-center">
                              <ChefHat className="h-5 w-5 text-(--color-placeholder-icon)" />
                            </div>
                          )}
                          <div className="px-1.5 py-1">
                            <p className="text-xs font-medium leading-tight line-clamp-2">{meal.recipe.title}</p>
                          </div>
                        </Link>
                        <button
                          onClick={() => removeMealPlan(meal.id)}
                          className="absolute top-1 right-1 p-0.5 rounded bg-background/70 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <Select value="" onValueChange={(recipeId) => { if (recipeId) handleAdd(day, type, recipeId); }}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="+ Add" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipes.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shopping List Preview</DialogTitle>
            <DialogDescription>
              These items will be added to your shopping list. Existing unpurchased items will be replaced.
            </DialogDescription>
          </DialogHeader>

          {previewItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nothing to add — your pantry covers everything for this week.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {previewItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted">
                  <span className="text-sm font-medium capitalize">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>Cancel</Button>
            {previewItems.length > 0 && (
              <Button onClick={handleConfirmGenerate} disabled={confirmPending}>
                {confirmPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add {previewItems.length} items
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
