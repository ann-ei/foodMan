import { db } from "@/lib/db";
import type { RecipeMatch, RecipeWithIngredients, PantryItemWithIngredient } from "@/types";

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

function normalize(name: string): string {
  return name.toLowerCase().trim().replace(/s$/, ""); // basic plural removal
}

// Check if a pantry item matches a recipe ingredient using fuzzy + synonyms
function isMatch(
  pantryName: string,
  ingredientName: string,
  synonymMap: Map<string, string[]>
): boolean {
  const pNorm = normalize(pantryName);
  const iNorm = normalize(ingredientName);

  // Exact match
  if (pNorm === iNorm) return true;

  // Contains match
  if (pNorm.includes(iNorm) || iNorm.includes(pNorm)) return true;

  // Fuzzy match (threshold 0.8)
  if (similarity(pNorm, iNorm) >= 0.8) return true;

  // Synonym match
  const synonyms = synonymMap.get(iNorm) || [];
  for (const syn of synonyms) {
    const synNorm = normalize(syn);
    if (pNorm === synNorm || similarity(pNorm, synNorm) >= 0.8) return true;
  }

  return false;
}

export async function getRecipeMatches(): Promise<RecipeMatch[]> {
  const [recipes, pantryItems, synonyms, histories] = await Promise.all([
    db.recipe.findMany({
      include: {
        ingredients: { include: { ingredient: true } },
        cookingHistory: { orderBy: { cookedAt: "desc" }, take: 1 },
      },
    }),
    db.pantryItem.findMany({ include: { ingredient: true } }),
    db.ingredientSynonym.findMany({ include: { ingredient: true } }),
    db.cookingHistory.findMany({ orderBy: { cookedAt: "desc" } }),
  ]);

  // Build synonym map: ingredient name -> synonyms[]
  const synonymMap = new Map<string, string[]>();
  for (const syn of synonyms) {
    const name = normalize(syn.ingredient.name);
    const existing = synonymMap.get(name) || [];
    existing.push(syn.synonym);
    synonymMap.set(name, existing);
  }

  // Build history map: recipeId -> last cooked date
  const historyMap = new Map<string, Date>();
  for (const h of histories) {
    if (!historyMap.has(h.recipeId)) {
      historyMap.set(h.recipeId, h.cookedAt);
    }
  }

  const pantryNames = pantryItems.map((p) => p.ingredient.name);

  return recipes.map((recipe) => {
    const total = recipe.ingredients.length;
    const matched: string[] = [];
    const missing: string[] = [];

    for (const ri of recipe.ingredients) {
      const ingredientName = ri.ingredient.name;
      const found = pantryNames.some((pn) => isMatch(pn, ingredientName, synonymMap));
      if (found) {
        matched.push(ingredientName);
      } else {
        missing.push(ingredientName);
      }
    }

    const matchScore = total > 0 ? Math.round((matched.length / total) * 100) : 0;
    const lastCooked = historyMap.get(recipe.id) || null;
    const daysSinceCooked = lastCooked
      ? Math.floor((Date.now() - lastCooked.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      recipe: recipe as RecipeWithIngredients,
      matchScore,
      matchedIngredients: matched,
      missingIngredients: missing,
      lastCooked,
      daysSinceCooked,
    };
  });
}

export async function getCookNowSuggestions() {
  const matches = await getRecipeMatches();
  return matches
    .filter((m) => m.matchScore >= 50)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}

export async function getRediscoverSuggestions() {
  const matches = await getRecipeMatches();
  return matches
    .filter((m) => m.daysSinceCooked !== null && m.daysSinceCooked > 14)
    .sort((a, b) => (b.daysSinceCooked || 0) - (a.daysSinceCooked || 0))
    .slice(0, 10);
}

export async function getExpiringIngredientSuggestions() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const expiringItems = await db.pantryItem.findMany({
    where: {
      expirationDate: { lte: threeDaysFromNow, gte: new Date() },
    },
    include: { ingredient: true },
  });

  if (expiringItems.length === 0) return [];

  const expiringNames = expiringItems.map((i) => i.ingredient.name);
  const matches = await getRecipeMatches();

  return matches
    .filter((m) =>
      m.matchedIngredients.some((ing) =>
        expiringNames.some((en) => isMatch(en, ing, new Map()))
      )
    )
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}
