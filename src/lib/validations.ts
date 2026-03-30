import { z } from "zod";

export const ingredientInput = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

export const recipeInput = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  categories: z.array(z.enum(["breakfast", "lunch", "dinner", "snack", "dessert", "drink"])).optional(),
  prepTime: z.number().int().positive().optional(),
  cookTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  ingredients: z.array(ingredientInput).min(1, "At least one ingredient is required"),
});

export const pantryItemInput = z.object({
  ingredientName: z.string().min(1, "Ingredient name is required"),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  expirationDate: z.string().optional(),
});

export const shoppingItemInput = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
});

export const mealPlanInput = z.object({
  date: z.string().min(1),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  recipeId: z.string().min(1),
});

export const signupInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginInput = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupInput>;
export type LoginInput = z.infer<typeof loginInput>;
export type RecipeInput = z.infer<typeof recipeInput>;
export type PantryItemInput = z.infer<typeof pantryItemInput>;
export type ShoppingItemInput = z.infer<typeof shoppingItemInput>;
export type MealPlanInput = z.infer<typeof mealPlanInput>;
