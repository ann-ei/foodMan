import { Suspense } from "react";
import { SuggestionSection } from "@/components/home/suggestion-section";
import { getAllSuggestions } from "@/lib/services/matching";

export const dynamic = "force-dynamic";

async function Suggestions() {
  const { cookNow, rediscover, expiring } = await getAllSuggestions();
  const hasAnySuggestions = cookNow.length > 0 || rediscover.length > 0 || expiring.length > 0;

  return (
    <>
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
    </>
  );
}

function SuggestionsSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
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

      <Suspense fallback={<SuggestionsSkeleton />}>
        <Suggestions />
      </Suspense>
    </div>
  );
}
