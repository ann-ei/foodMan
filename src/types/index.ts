import type {
  Recipe,
  Ingredient,
  RecipeIngredient,
  PantryItem,
  CookingHistory,
  MealPlan,
  ShoppingListItem,
} from "@prisma/client";

export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & {
    ingredient: Ingredient;
  })[];
  cookingHistory?: CookingHistory[];
};

export type PantryItemWithIngredient = PantryItem & {
  ingredient: Ingredient;
};

export type MealPlanWithRecipe = MealPlan & {
  recipe: RecipeWithIngredients;
};

export type RecipeMatch = {
  recipe: RecipeWithIngredients;
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  lastCooked: Date | null;
  daysSinceCooked: number | null;
};

export type SuggestionType = "cook-now" | "rediscover" | "expiring";

export type Suggestion = {
  type: SuggestionType;
  recipe: RecipeWithIngredients;
  matchScore: number;
  missingIngredients: string[];
  reason: string;
  lastCooked: Date | null;
};

export { Recipe, Ingredient, RecipeIngredient, PantryItem, CookingHistory, MealPlan, ShoppingListItem };
