import { createFileRoute } from "@tanstack/react-router";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { TrendingCarousel } from "@/components/site/TrendingCarousel";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <HeroCarousel />
      <CategoryGrid />
      <TrendingCarousel />
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 sm:grid-cols-3 lg:px-8">
          {[
            { t: "Free shipping", d: "On orders over RS. 80" },
            { t: "30-day returns", d: "No questions asked" },
            { t: "Secure checkout", d: "Cards & cash on delivery" },
          ].map((f) => (
            <div key={f.t} className="text-center">
              <h3 className="text-base font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
