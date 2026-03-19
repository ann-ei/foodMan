import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create ingredients
  const ingredients = await Promise.all(
    [
      "chicken breast", "rice", "olive oil", "garlic", "onion", "salt", "pepper",
      "tomato", "pasta", "parmesan cheese", "basil", "lemon", "butter", "flour",
      "egg", "milk", "sugar", "cinnamon", "bell pepper", "broccoli", "carrot",
      "ginger", "soy sauce", "sesame oil", "potato", "mushroom", "spinach",
      "avocado", "lime", "cilantro", "cumin", "paprika", "honey", "salmon",
      "shrimp", "tortilla", "black beans", "corn", "cream cheese", "mozzarella",
    ].map((name) =>
      prisma.ingredient.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const ing = (name: string) => ingredients.find((i) => i.name === name)!;

  // Create synonyms
  const synonymPairs = [
    ["chicken breast", "chicken"],
    ["olive oil", "oil"],
    ["parmesan cheese", "parmesan"],
    ["bell pepper", "capsicum"],
    ["cilantro", "coriander"],
    ["shrimp", "prawn"],
    ["mozzarella", "mozzarella cheese"],
  ];

  for (const [ingredientName, synonym] of synonymPairs) {
    const ingredient = ing(ingredientName);
    await prisma.ingredientSynonym.upsert({
      where: { synonym },
      update: {},
      create: { synonym, ingredientId: ingredient.id },
    });
  }

  // Create recipes
  const recipes = [
    {
      title: "Garlic Butter Chicken",
      description: "Juicy pan-seared chicken breast with a rich garlic butter sauce.",
      instructions: "1. Season chicken with salt and pepper.\n2. Heat olive oil in a pan over medium-high heat.\n3. Cook chicken 6-7 minutes per side until golden.\n4. Add butter and minced garlic to the pan.\n5. Baste chicken with garlic butter for 2 minutes.\n6. Serve with rice or vegetables.",
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      ingredients: [
        { name: "chicken breast", qty: 2, unit: "pieces" },
        { name: "garlic", qty: 4, unit: "cloves" },
        { name: "butter", qty: 2, unit: "tbsp" },
        { name: "olive oil", qty: 1, unit: "tbsp" },
        { name: "salt", qty: 1, unit: "tsp" },
        { name: "pepper", qty: 0.5, unit: "tsp" },
      ],
    },
    {
      title: "Classic Tomato Pasta",
      description: "Simple and delicious pasta with fresh tomato sauce.",
      instructions: "1. Cook pasta according to package directions.\n2. Saute garlic and onion in olive oil.\n3. Add diced tomatoes and basil.\n4. Simmer 15 minutes.\n5. Toss with pasta and top with parmesan.",
      prepTime: 10,
      cookTime: 25,
      servings: 4,
      ingredients: [
        { name: "pasta", qty: 400, unit: "g" },
        { name: "tomato", qty: 4, unit: "pieces" },
        { name: "garlic", qty: 3, unit: "cloves" },
        { name: "onion", qty: 1, unit: "piece" },
        { name: "olive oil", qty: 2, unit: "tbsp" },
        { name: "basil", qty: 10, unit: "leaves" },
        { name: "parmesan cheese", qty: 50, unit: "g" },
        { name: "salt", qty: 1, unit: "tsp" },
      ],
    },
    {
      title: "Veggie Stir-Fry",
      description: "Quick and healthy stir-fry with colorful vegetables.",
      instructions: "1. Slice all vegetables thinly.\n2. Heat sesame oil in a wok over high heat.\n3. Add garlic and ginger, cook 30 seconds.\n4. Add broccoli and carrots, stir-fry 3 minutes.\n5. Add bell pepper and mushrooms, cook 2 more minutes.\n6. Add soy sauce, toss everything together.\n7. Serve over rice.",
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      ingredients: [
        { name: "broccoli", qty: 1, unit: "cup" },
        { name: "carrot", qty: 2, unit: "pieces" },
        { name: "bell pepper", qty: 1, unit: "piece" },
        { name: "mushroom", qty: 1, unit: "cup" },
        { name: "garlic", qty: 2, unit: "cloves" },
        { name: "ginger", qty: 1, unit: "tbsp" },
        { name: "soy sauce", qty: 2, unit: "tbsp" },
        { name: "sesame oil", qty: 1, unit: "tbsp" },
        { name: "rice", qty: 2, unit: "cups" },
      ],
    },
    {
      title: "Lemon Herb Salmon",
      description: "Baked salmon with fresh lemon and herbs.",
      instructions: "1. Preheat oven to 200°C.\n2. Place salmon on a baking sheet.\n3. Drizzle with olive oil and lemon juice.\n4. Season with salt, pepper, and garlic.\n5. Bake 12-15 minutes until flaky.\n6. Garnish with fresh basil.",
      prepTime: 5,
      cookTime: 15,
      servings: 2,
      ingredients: [
        { name: "salmon", qty: 2, unit: "fillets" },
        { name: "lemon", qty: 1, unit: "piece" },
        { name: "olive oil", qty: 1, unit: "tbsp" },
        { name: "garlic", qty: 2, unit: "cloves" },
        { name: "basil", qty: 5, unit: "leaves" },
        { name: "salt", qty: 1, unit: "tsp" },
        { name: "pepper", qty: 0.5, unit: "tsp" },
      ],
    },
    {
      title: "Chicken Burrito Bowl",
      description: "Deconstructed burrito with all the fixings.",
      instructions: "1. Season and grill chicken breast.\n2. Cook rice with a squeeze of lime.\n3. Warm black beans with cumin.\n4. Slice avocado and dice tomato.\n5. Assemble bowls with rice, beans, chicken, and toppings.\n6. Top with cilantro and lime.",
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      ingredients: [
        { name: "chicken breast", qty: 2, unit: "pieces" },
        { name: "rice", qty: 1, unit: "cup" },
        { name: "black beans", qty: 1, unit: "can" },
        { name: "avocado", qty: 1, unit: "piece" },
        { name: "tomato", qty: 1, unit: "piece" },
        { name: "lime", qty: 1, unit: "piece" },
        { name: "cilantro", qty: 2, unit: "tbsp" },
        { name: "cumin", qty: 1, unit: "tsp" },
        { name: "corn", qty: 0.5, unit: "cup" },
      ],
    },
    {
      title: "Creamy Mushroom Risotto",
      description: "Rich and creamy Italian risotto with sauteed mushrooms.",
      instructions: "1. Saute mushrooms in butter until golden, set aside.\n2. Cook onion and garlic in olive oil.\n3. Add rice, toast 1 minute.\n4. Add broth one ladle at a time, stirring continuously.\n5. Stir in mushrooms, parmesan, and butter.\n6. Season with salt and pepper.",
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      ingredients: [
        { name: "rice", qty: 2, unit: "cups" },
        { name: "mushroom", qty: 2, unit: "cups" },
        { name: "onion", qty: 1, unit: "piece" },
        { name: "garlic", qty: 3, unit: "cloves" },
        { name: "butter", qty: 2, unit: "tbsp" },
        { name: "parmesan cheese", qty: 50, unit: "g" },
        { name: "olive oil", qty: 1, unit: "tbsp" },
        { name: "salt", qty: 1, unit: "tsp" },
      ],
    },
    {
      title: "Honey Garlic Shrimp",
      description: "Sweet and savory shrimp ready in 15 minutes.",
      instructions: "1. Pat shrimp dry, season with salt.\n2. Heat olive oil in a skillet over medium-high.\n3. Cook shrimp 2 minutes per side.\n4. Add minced garlic, honey, and soy sauce.\n5. Toss until shrimp are coated and glossy.\n6. Garnish with sesame seeds.",
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      ingredients: [
        { name: "shrimp", qty: 400, unit: "g" },
        { name: "honey", qty: 3, unit: "tbsp" },
        { name: "garlic", qty: 4, unit: "cloves" },
        { name: "soy sauce", qty: 2, unit: "tbsp" },
        { name: "olive oil", qty: 1, unit: "tbsp" },
        { name: "salt", qty: 0.5, unit: "tsp" },
      ],
    },
    {
      title: "Spinach & Egg Breakfast Wrap",
      description: "Quick and protein-packed breakfast wrap.",
      instructions: "1. Scramble eggs in butter.\n2. Saute spinach with garlic until wilted.\n3. Warm tortilla.\n4. Layer cream cheese, eggs, and spinach.\n5. Roll up and serve.",
      prepTime: 5,
      cookTime: 10,
      servings: 1,
      ingredients: [
        { name: "egg", qty: 2, unit: "pieces" },
        { name: "spinach", qty: 1, unit: "cup" },
        { name: "tortilla", qty: 1, unit: "piece" },
        { name: "cream cheese", qty: 1, unit: "tbsp" },
        { name: "butter", qty: 1, unit: "tsp" },
        { name: "garlic", qty: 1, unit: "clove" },
        { name: "salt", qty: 0.25, unit: "tsp" },
      ],
    },
    {
      title: "Classic Cinnamon Pancakes",
      description: "Fluffy homemade pancakes with a hint of cinnamon.",
      instructions: "1. Mix flour, sugar, cinnamon, and salt.\n2. In another bowl, whisk eggs, milk, and melted butter.\n3. Combine wet and dry ingredients.\n4. Cook on a buttered pan until bubbles form, flip.\n5. Serve with honey or maple syrup.",
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      ingredients: [
        { name: "flour", qty: 1.5, unit: "cups" },
        { name: "egg", qty: 2, unit: "pieces" },
        { name: "milk", qty: 1, unit: "cup" },
        { name: "butter", qty: 2, unit: "tbsp" },
        { name: "sugar", qty: 2, unit: "tbsp" },
        { name: "cinnamon", qty: 1, unit: "tsp" },
        { name: "salt", qty: 0.5, unit: "tsp" },
      ],
    },
    {
      title: "Loaded Baked Potato",
      description: "Crispy baked potato with all the toppings.",
      instructions: "1. Preheat oven to 200°C.\n2. Prick potatoes with a fork, rub with olive oil and salt.\n3. Bake 45-60 minutes until crispy outside, fluffy inside.\n4. Cut open and load with butter, cheese, and toppings.\n5. Garnish with chives or green onion.",
      prepTime: 5,
      cookTime: 60,
      servings: 2,
      ingredients: [
        { name: "potato", qty: 2, unit: "large" },
        { name: "butter", qty: 2, unit: "tbsp" },
        { name: "mozzarella", qty: 50, unit: "g" },
        { name: "olive oil", qty: 1, unit: "tbsp" },
        { name: "salt", qty: 1, unit: "tsp" },
        { name: "pepper", qty: 0.5, unit: "tsp" },
      ],
    },
  ];

  for (const r of recipes) {
    const recipe = await prisma.recipe.create({
      data: {
        title: r.title,
        description: r.description,
        instructions: r.instructions,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        servings: r.servings,
        ingredients: {
          create: r.ingredients.map((i) => ({
            quantity: i.qty,
            unit: i.unit,
            ingredientId: ing(i.name).id,
          })),
        },
      },
    });

    // Add some cooking history for the first 5 recipes
    if (recipes.indexOf(r) < 5) {
      const daysAgo = [3, 21, 45, 7, 30][recipes.indexOf(r)];
      await prisma.cookingHistory.create({
        data: {
          recipeId: recipe.id,
          cookedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Create pantry items
  const pantryItems = [
    { name: "chicken breast", qty: 4, unit: "pieces", daysUntilExpiry: 2 },
    { name: "rice", qty: 2, unit: "kg", daysUntilExpiry: null },
    { name: "olive oil", qty: 1, unit: "bottle", daysUntilExpiry: null },
    { name: "garlic", qty: 1, unit: "head", daysUntilExpiry: 14 },
    { name: "onion", qty: 3, unit: "pieces", daysUntilExpiry: 10 },
    { name: "salt", qty: 1, unit: "box", daysUntilExpiry: null },
    { name: "pepper", qty: 1, unit: "jar", daysUntilExpiry: null },
    { name: "tomato", qty: 4, unit: "pieces", daysUntilExpiry: 3 },
    { name: "pasta", qty: 500, unit: "g", daysUntilExpiry: null },
    { name: "butter", qty: 200, unit: "g", daysUntilExpiry: 14 },
    { name: "egg", qty: 6, unit: "pieces", daysUntilExpiry: 7 },
    { name: "milk", qty: 1, unit: "liter", daysUntilExpiry: 4 },
    { name: "parmesan cheese", qty: 100, unit: "g", daysUntilExpiry: 21 },
    { name: "lemon", qty: 2, unit: "pieces", daysUntilExpiry: 5 },
    { name: "spinach", qty: 1, unit: "bag", daysUntilExpiry: 2 },
  ];

  for (const item of pantryItems) {
    const ingredient = ing(item.name);
    await prisma.pantryItem.create({
      data: {
        ingredientId: ingredient.id,
        quantity: item.qty,
        unit: item.unit,
        expirationDate: item.daysUntilExpiry
          ? new Date(Date.now() + item.daysUntilExpiry * 24 * 60 * 60 * 1000)
          : null,
      },
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
