import { SuggestionSection } from "@/components/home/suggestion-section";
import {
  getCookNowSuggestions,
  getRediscoverSuggestions,
  getExpiringIngredientSuggestions,
} from "@/lib/services/matching";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [cookNow, rediscover, expiring] = await Promise.all([
    getCookNowSuggestions(),
    getRediscoverSuggestions(),
    getExpiringIngredientSuggestions(),
  ]);

  const hasAnySuggestions = cookNow.length > 0 || rediscover.length > 0 || expiring.length > 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">
          <span className="text-primary">myFood</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Your smart cooking assistant. Here&apos;s what you can make today.
        </p>
      </div>

      {!hasAnySuggestions && (
        <div className="text-center py-16 space-y-4">
          <p className="text-6xl">🥗</p>
          <h2 className="text-xl font-semibold">Welcome to myFood!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start by adding recipes and stocking your pantry. Once you do, smart suggestions will appear here.
          </p>
        </div>
      )}

      <SuggestionSection
        title="Cook Now"
        icon="🍳"
        description="Recipes you can make with what you have"
        matches={cookNow}
      />

      <SuggestionSection
        title="Rediscover"
        icon="🕒"
        description="Recipes you haven't cooked in a while"
        matches={rediscover}
      />

      <SuggestionSection
        title="Use Before It Expires"
        icon="🥕"
        description="Cook these before your ingredients go bad"
        matches={expiring}
      />
    </div>
  );
}
