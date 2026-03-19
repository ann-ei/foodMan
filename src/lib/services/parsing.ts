type ParsedIngredient = {
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
};

const UNITS = [
  "cup", "cups", "tbsp", "tablespoon", "tablespoons",
  "tsp", "teaspoon", "teaspoons", "oz", "ounce", "ounces",
  "lb", "lbs", "pound", "pounds", "g", "gram", "grams",
  "kg", "kilogram", "kilograms", "ml", "milliliter", "milliliters",
  "l", "liter", "liters", "piece", "pieces", "slice", "slices",
  "clove", "cloves", "can", "cans", "bunch", "pinch",
];

const UNIT_PATTERN = new RegExp(`^(${UNITS.join("|")})\\b\\.?`, "i");

// Parse a single ingredient line like "2 cups flour" or "1/2 tsp salt"
export function parseIngredientLine(line: string): ParsedIngredient {
  const trimmed = line.trim().replace(/^[-*•]\s*/, "");
  if (!trimmed) return { name: trimmed };

  let remaining = trimmed;
  let quantity: number | undefined;
  let unit: string | undefined;
  let notes: string | undefined;

  // Extract notes in parentheses
  const notesMatch = remaining.match(/\(([^)]+)\)/);
  if (notesMatch) {
    notes = notesMatch[1];
    remaining = remaining.replace(notesMatch[0], "").trim();
  }

  // Extract quantity (supports fractions like 1/2, mixed like 1 1/2, decimals)
  const qtyMatch = remaining.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+\.?\d*)\s*/);
  if (qtyMatch) {
    const qtyStr = qtyMatch[1];
    if (qtyStr.includes(" ") && qtyStr.includes("/")) {
      const [whole, frac] = qtyStr.split(/\s+/);
      const [num, den] = frac.split("/");
      quantity = parseInt(whole) + parseInt(num) / parseInt(den);
    } else if (qtyStr.includes("/")) {
      const [num, den] = qtyStr.split("/");
      quantity = parseInt(num) / parseInt(den);
    } else {
      quantity = parseFloat(qtyStr);
    }
    remaining = remaining.slice(qtyMatch[0].length).trim();
  }

  // Extract unit
  const unitMatch = remaining.match(UNIT_PATTERN);
  if (unitMatch) {
    unit = unitMatch[1].toLowerCase();
    remaining = remaining.slice(unitMatch[0].length).trim();
    // Remove "of" after unit
    remaining = remaining.replace(/^of\s+/i, "");
  }

  return {
    name: remaining.trim() || trimmed,
    quantity,
    unit,
    notes,
  };
}

// Parse multiple ingredient lines
export function parseIngredients(text: string): ParsedIngredient[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(parseIngredientLine);
}

// Parse a full recipe from pasted text
export function parseRecipeText(text: string): {
  title: string;
  ingredients: ParsedIngredient[];
  instructions: string;
} {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { title: "", ingredients: [], instructions: "" };
  }

  // First line is title
  const title = lines[0];

  // Find ingredients section (lines that look like ingredient lines)
  const ingredientLines: string[] = [];
  const instructionLines: string[] = [];
  let inIngredients = false;
  let inInstructions = false;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (lower.includes("ingredient")) {
      inIngredients = true;
      inInstructions = false;
      continue;
    }
    if (lower.includes("instruction") || lower.includes("direction") || lower.includes("method") || lower.includes("step")) {
      inIngredients = false;
      inInstructions = true;
      continue;
    }

    if (inIngredients) {
      ingredientLines.push(line);
    } else if (inInstructions) {
      instructionLines.push(line);
    } else {
      // Heuristic: if line starts with a number or bullet, it's likely an ingredient
      if (/^[\d•\-*]/.test(line)) {
        ingredientLines.push(line);
      } else {
        instructionLines.push(line);
      }
    }
  }

  return {
    title,
    ingredients: ingredientLines.map(parseIngredientLine),
    instructions: instructionLines.join("\n"),
  };
}
