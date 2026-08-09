"use client";

import Link from "next/link";
import { useFavorites } from "@/hooks/use-favorites";
import { FavoriteButton } from "@/components/favorite-button";
import { foods } from "@/data";
import { slugify } from "@/lib/utils";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  const favoriteFoods = foods
    .map((food) => ({ ...food, slug: slugify(food.name) }))
    .filter((food) => favorites.includes(food.slug));

  return (
    <div className="min-h-screen text-white p-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
        Your <span className="title_colored">Favorites</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Foods you&apos;ve saved for quick access.
      </p>

      {favoriteFoods.length === 0 ? (
        <p className="text-muted-foreground">
          Aucun favori pour l&apos;instant, ajoutez-en depuis la recherche.
        </p>
      ) : (
        <ul className="space-y-3">
          {favoriteFoods.map((food) => (
            <li key={food.slug}>
              <Link
                href={`/food/${food.slug}`}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-inner hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium">{food.name}</span>
                <FavoriteButton slug={food.slug} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
