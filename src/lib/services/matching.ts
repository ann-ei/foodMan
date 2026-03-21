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

// Pre-compute normalized pantry names into a Set for fast exact/contains lookups,
// and keep the array only for fuzzy fallback
function buildPantryIndex(pantryItems: PantryItemWithIngredient[]) {
  const normalizedNames = pantryItems.map((p) => normalize(p.ingredient.name));
  const nameSet = new Set(normalizedNames);
  return { normalizedNames, nameSet };
}

// Check if a pantry item matches a recipe ingredient using exact > contains > fuzzy > synonyms
function isMatch(
  ingredientName: string,
  pantryIndex: ReturnType<typeof buildPantryIndex>,
  synonymMap: Map<string, string[]>
): boolean {
  const iNorm = normalize(ingredientName);
  const { normalizedNames, nameSet } = pantryIndex;

  // Exact match (O(1) Set lookup)
  if (nameSet.has(iNorm)) return true;

  // Contains match + fuzzy only against pantry items (skip Levenshtein when possible)
  for (const pNorm of normalizedNames) {
    if (pNorm.includes(iNorm) || iNorm.includes(pNorm)) return true;
  }

  // Fuzzy match - only if short names where contains wouldn't catch typos
  if (iNorm.length <= 8) {
    for (const pNorm of normalizedNames) {
      if (Math.abs(pNorm.length - iNorm.length) <= 2 && similarity(pNorm, iNorm) >= 0.8) return true;
    }
  }

  // Synonym match (exact only — synonyms should be pre-defined correctly)
  const synonyms = synonymMap.get(iNorm) || [];
  for (const syn of synonyms) {
    const synNorm = normalize(syn);
    if (nameSet.has(synNorm)) return true;
    // Contains fallback for synonyms
    for (const pNorm of normalizedNames) {
      if (pNorm.includes(synNorm) || synNorm.includes(pNorm)) return true;
    }
  }

  return false;
}

// Single DB fetch, returns all data needed for suggestions
async function fetchMatchData() {
  const [recipes, pantryItems, synonyms] = await Promise.all([
    db.recipe.findMany({
      include: {
        ingredients: { include: { ingredient: true } },
        cookingHistory: { orderBy: { cookedAt: "desc" as const }, take: 1 },
      },
    }),
    db.pantryItem.findMany({ include: { ingredient: true } }),
    db.ingredientSynonym.findMany({ include: { ingredient: true } }),
  ]);

  return { recipes, pantryItems, synonyms };
}

function computeMatches(
  recipes: Awaited<ReturnType<typeof fetchMatchData>>["recipes"],
  pantryItems: PantryItemWithIngredient[],
  synonyms: Awaited<ReturnType<typeof fetchMatchData>>["synonyms"]
): RecipeMatch[] {
  // Build synonym map
  const synonymMap = new Map<string, string[]>();
  for (const syn of synonyms) {
    const name = normalize(syn.ingredient.name);
    const existing = synonymMap.get(name) || [];
    existing.push(syn.synonym);
    synonymMap.set(name, existing);
  }

  // Build pantry index once
  const pantryIndex = buildPantryIndex(pantryItems);

  return recipes.map((recipe) => {
    const total = recipe.ingredients.length;
    const matched: string[] = [];
    const missing: string[] = [];

    for (const ri of recipe.ingredients) {
      const ingredientName = ri.ingredient.name;
      if (isMatch(ingredientName, pantryIndex, synonymMap)) {
        matched.push(ingredientName);
      } else {
        missing.push(ingredientName);
      }
    }

    const matchScore = total > 0 ? Math.round((matched.length / total) * 100) : 0;
    const lastCooked = recipe.cookingHistory[0]?.cookedAt ?? null;
    const daysSinceCooked = lastCooked
      ? Math.floor((Date.now() - new Date(lastCooked).getTime()) / (1000 * 60 * 60 * 24))
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

// Simple in-memory cache with TTL
let matchCache: { data: RecipeMatch[]; timestamp: number } | null = null;
const CACHE_TTL = 30_000; // 30 seconds

export async function getRecipeMatches(): Promise<RecipeMatch[]> {
  const now = Date.now();
  if (matchCache && now - matchCache.timestamp < CACHE_TTL) {
    return matchCache.data;
  }
  const { recipes, pantryItems, synonyms } = await fetchMatchData();
  const data = computeMatches(recipes, pantryItems, synonyms);
  matchCache = { data, timestamp: now };
  return data;
}

// All suggestions computed from a single getRecipeMatches() call
export async function getAllSuggestions() {
  const matches = await getRecipeMatches();

  const cookNow = matches
    .filter((m) => m.matchScore >= 50)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  const rediscover = matches
    .filter((m) => m.daysSinceCooked !== null && m.daysSinceCooked > 14)
    .sort((a, b) => (b.daysSinceCooked || 0) - (a.daysSinceCooked || 0))
    .slice(0, 10);

  // Expiring ingredients
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const now = new Date();

  const expiringItems = await db.pantryItem.findMany({
    where: {
      expirationDate: { lte: threeDaysFromNow, gte: now },
    },
    include: { ingredient: true },
  });

  const expiringNameSet = new Set(expiringItems.map((i) => normalize(i.ingredient.name)));

  const expiring = expiringItems.length === 0
    ? []
    : matches
        .filter((m) =>
          m.matchedIngredients.some((ing) => expiringNameSet.has(normalize(ing)))
        )
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

  return { cookNow, rediscover, expiring };
}

// Keep individual exports for pages that only need one type
export async function getCookNowSuggestions() {
  const { cookNow } = await getAllSuggestions();
  return cookNow;
}

export async function getRediscoverSuggestions() {
  const { rediscover } = await getAllSuggestions();
  return rediscover;
}

export async function getExpiringIngredientSuggestions() {
  const { expiring } = await getAllSuggestions();
  return expiring;
}
