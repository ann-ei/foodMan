"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Loader2 } from "lucide-react";
import { createRecipe, updateRecipe } from "@/actions/recipes";
import { parseIngredients, parseRecipeText } from "@/lib/services/parsing";
import type { RecipeInput } from "@/lib/validations";
import type { RecipeWithIngredients } from "@/types";
import { useRouter } from "next/navigation";

type IngredientField = {
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
};

export function RecipeForm({ recipe }: { recipe?: RecipeWithIngredients }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(recipe?.title || "");
  const [description, setDescription] = useState(recipe?.description || "");
  const [instructions, setInstructions] = useState(recipe?.instructions || "");
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl || "");
  const [sourceUrl, setSourceUrl] = useState(recipe?.sourceUrl || "");
  const [prepTime, setPrepTime] = useState<string>(recipe?.prepTime?.toString() || "");
  const [cookTime, setCookTime] = useState<string>(recipe?.cookTime?.toString() || "");
  const [servings, setServings] = useState<string>(recipe?.servings?.toString() || "");
  const [ingredients, setIngredients] = useState<IngredientField[]>(
    recipe?.ingredients.map((ri) => ({
      name: ri.ingredient.name,
      quantity: ri.quantity || undefined,
      unit: ri.unit || undefined,
      notes: ri.notes || undefined,
    })) || [{ name: "" }]
  );

  const [pasteText, setPasteText] = useState("");
  const [importUrl, setImportUrl] = useState("");

  const addIngredient = () => setIngredients([...ingredients, { name: "" }]);

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredientField, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handlePasteImport = () => {
    const parsed = parseRecipeText(pasteText);
    if (parsed.title) setTitle(parsed.title);
    if (parsed.instructions) setInstructions(parsed.instructions);
    if (parsed.ingredients.length > 0) {
      setIngredients(
        parsed.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          notes: i.notes,
        }))
      );
    }
  };

  const handleBulkIngredients = (text: string) => {
    const parsed = parseIngredients(text);
    if (parsed.length > 0) {
      setIngredients(
        parsed.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          notes: i.notes,
        }))
      );
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: RecipeInput = {
        title,
        description: description || undefined,
        instructions: instructions || undefined,
        imageUrl: imageUrl || undefined,
        sourceUrl: sourceUrl || undefined,
        prepTime: prepTime ? parseInt(prepTime) : undefined,
        cookTime: cookTime ? parseInt(cookTime) : undefined,
        servings: servings ? parseInt(servings) : undefined,
        ingredients: ingredients.filter((i) => i.name.trim()),
      };

      if (recipe) {
        await updateRecipe(recipe.id, data);
        router.push(`/recipes/${recipe.id}`);
      } else {
        const created = await createRecipe(data);
        router.push(`/recipes/${created.id}`);
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual">
        <TabsList className="mb-4">
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="paste">Paste Text</TabsTrigger>
          <TabsTrigger value="url">Import URL</TabsTrigger>
        </TabsList>

        <TabsContent value="paste">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paste Recipe Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your recipe here... First line = title, then ingredients and instructions"
                rows={10}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              <Button onClick={handlePasteImport}>Parse Recipe</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Import from URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="https://example.com/recipe"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
              />
              <Button disabled>Import (Coming Soon)</Button>
              <p className="text-sm text-muted-foreground">URL import requires server-side HTML parsing setup.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <div className="sr-only">Manual entry form below</div>
        </TabsContent>
      </Tabs>

      {/* Main form fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recipe Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recipe title" />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prepTime">Prep (min)</Label>
              <Input id="prepTime" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cookTime">Cook (min)</Label>
              <Input id="cookTime" type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input id="servings" type="number" value={servings} onChange={(e) => setServings(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input id="sourceUrl" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ingredients *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="mb-4">
            <Label>Bulk paste ingredients (one per line)</Label>
            <Textarea
              placeholder="2 cups flour&#10;1 tsp salt&#10;3 eggs"
              rows={3}
              onChange={(e) => {
                if (e.target.value.includes("\n")) {
                  handleBulkIngredients(e.target.value);
                }
              }}
              onBlur={(e) => {
                if (e.target.value.trim()) handleBulkIngredients(e.target.value);
              }}
            />
          </div>

          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                />
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={ing.quantity || ""}
                  onChange={(e) => updateIngredient(idx, "quantity", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="w-20">
                <Input
                  placeholder="Unit"
                  value={ing.unit || ""}
                  onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeIngredient(idx)} disabled={ingredients.length === 1}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addIngredient}>
            <Plus className="h-4 w-4 mr-1" /> Add Ingredient
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Step by step instructions..."
            rows={8}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={loading || !title || ingredients.filter((i) => i.name.trim()).length === 0} size="lg" className="w-full">
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {recipe ? "Update Recipe" : "Create Recipe"}
      </Button>
    </div>
  );
}
