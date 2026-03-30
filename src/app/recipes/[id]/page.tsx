import { db } from "@/lib/db";
import { getRequiredUser } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChefHat, Clock, Users, Heart, ArrowLeft } from "lucide-react";
import { markAsCooked, deleteRecipe } from "@/actions/recipes";
import { FavoriteButton } from "@/components/recipes/favorite-button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getRequiredUser();
  const { id } = await params;

  const recipe = await db.recipe.findFirst({
    where: { id, userId: user.id },
    include: {
      ingredients: { include: { ingredient: true } },
      cookingHistory: { orderBy: { cookedAt: "desc" }, take: 10 },
    },
  });

  if (!recipe) notFound();

  const handleDelete = async () => {
    "use server";
    await deleteRecipe(id);
    redirect("/recipes");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/recipes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to recipes
      </Link>

      {recipe.imageUrl ? (
        <div className="h-64 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${recipe.imageUrl})` }} />
      ) : (
        <div className="h-64 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
          <ChefHat className="h-16 w-16 text-green-400" />
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          {recipe.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {recipe.categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="capitalize">{cat}</Badge>
              ))}
            </div>
          )}
          {recipe.description && <p className="text-muted-foreground mt-1">{recipe.description}</p>}
        </div>
        <FavoriteButton recipeId={recipe.id} initialFavorite={recipe.isFavorite} />
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        {recipe.prepTime && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> Prep: {recipe.prepTime}m
          </span>
        )}
        {recipe.cookTime && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> Cook: {recipe.cookTime}m
          </span>
        )}
        {recipe.servings && (
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> {recipe.servings} servings
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recipe.ingredients.map((ri) => (
              <li key={ri.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>
                  {ri.quantity && `${ri.quantity} `}
                  {ri.unit && `${ri.unit} `}
                  <span className="font-medium capitalize">{ri.ingredient.name}</span>
                  {ri.notes && <span className="text-muted-foreground"> ({ri.notes})</span>}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {recipe.instructions && (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{recipe.instructions}</div>
          </CardContent>
        </Card>
      )}

      {recipe.cookingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cooking History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recipe.cookingHistory.map((h) => (
                <div key={h.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{formatDate(h.cookedAt)}</Badge>
                  {h.notes && <span className="text-muted-foreground">{h.notes}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex gap-3">
        <form action={async () => { "use server"; await markAsCooked(id); }}>
          <Button type="submit">
            <ChefHat className="h-4 w-4 mr-2" />
            Mark as Cooked
          </Button>
        </form>
        <Link href={`/recipes/${id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
        <form action={handleDelete}>
          <Button variant="destructive" type="submit">Delete</Button>
        </form>
      </div>
    </div>
  );
}
