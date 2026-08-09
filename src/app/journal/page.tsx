"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useJournal } from "@/hooks/use-journal";
import { foods } from "@/data";
import { slugify } from "@/lib/utils";

const DAILY_GOAL_KEY = "nutrispark:dailyGoal";

function subscribeToDailyGoal(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getDailyGoalSnapshot(): number | null {
  const stored = window.localStorage.getItem(DAILY_GOAL_KEY);
  return stored ? Number(stored) : null;
}

function getDailyGoalServerSnapshot(): number | null {
  return null;
}

export default function JournalPage() {
  const { entries, removeEntry, totals } = useJournal();
  const dailyGoal = useSyncExternalStore(
    subscribeToDailyGoal,
    getDailyGoalSnapshot,
    getDailyGoalServerSnapshot
  );

  const foodBySlug = new Map(foods.map((food) => [slugify(food.name), food]));

  const progressPercent =
    dailyGoal && dailyGoal > 0
      ? Math.min(100, Math.round((totals.calories / dailyGoal) * 100))
      : 0;

  return (
    <div className="min-h-screen text-white p-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
        Today&apos;s <span className="title_colored">Journal</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Track what you&apos;ve eaten today.
      </p>

      <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-inner">
        {dailyGoal ? (
          <>
            <p className="text-sm text-muted-foreground mb-2">
              Calories today
            </p>
            <p className="text-2xl font-semibold mb-3">
              {Math.round(totals.calories)} / {dailyGoal} kcal
            </p>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F28907]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <span>Protein: {totals.protein.toFixed(1)} g</span>
              <span>Carbs: {totals.carbohydrates.toFixed(1)} g</span>
              <span>Fat: {totals.fat.toFixed(1)} g</span>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">
            No calorie goal set yet.{" "}
            <Link href="/calculator" className="underline">
              Use the calculator
            </Link>{" "}
            to set your daily target.
          </p>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">Entries</h2>
      {entries.length === 0 ? (
        <p className="text-muted-foreground">
          No entries yet today. Add foods from their detail page.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => {
            const food = foodBySlug.get(entry.foodSlug);
            const calories = food
              ? Math.round((food.calories * entry.quantity) / 100)
              : 0;
            return (
              <li
                key={entry.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-inner"
              >
                <div>
                  <Link
                    href={`/food/${entry.foodSlug}`}
                    className="font-medium hover:underline"
                  >
                    {food?.name ?? entry.foodSlug}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {entry.quantity}g · {calories} kcal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="text-sm text-muted-foreground hover:text-red-500 cursor-pointer"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
