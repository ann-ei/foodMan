"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Trash2, ShoppingCart } from "lucide-react";
import { addMealPlan, removeMealPlan, generateShoppingList } from "@/actions/meal-planner";
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
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getMealsForDay = (date: Date, mealType: string) =>
    mealPlans.filter(
      (mp) => isSameDay(new Date(mp.date), date) && mp.mealType === mealType
    );

  const handleAdd = async (date: Date, mealType: string, recipeId: string) => {
    await addMealPlan({
      date: format(date, "yyyy-MM-dd"),
      mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      recipeId,
    });
  };

  const handleGenerateList = async () => {
    const start = format(weekStart, "yyyy-MM-dd");
    const end = format(addDays(weekStart, 6), "yyyy-MM-dd");
    await generateShoppingList(start, end);
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
        <Button variant="outline" onClick={handleGenerateList}>
          <ShoppingCart className="h-4 w-4 mr-2" />
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
                      <div key={meal.id} className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs truncate flex-1">
                          {meal.recipe.title}
                        </Badge>
                        <button
                          onClick={() => removeMealPlan(meal.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <Select onValueChange={(recipeId) => handleAdd(day, type, recipeId)}>
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
    </div>
  );
}
