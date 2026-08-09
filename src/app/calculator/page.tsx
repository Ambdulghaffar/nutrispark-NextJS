"use client";

import * as React from "react";
import { useState } from "react";
import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "light", label: "Light (exercise 1-3 days/week)" },
  { value: "moderate", label: "Moderate (exercise 3-5 days/week)" },
  { value: "active", label: "Active (exercise 6-7 days/week)" },
  { value: "very-active", label: "Very active (hard exercise & physical job)" },
] as const;

interface TdeeResult {
  bmr: number;
  tdee: number;
  macros: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

const DAILY_GOAL_KEY = "nutrispark:dailyGoal";

export default function CalculatorPage() {
  const router = useRouter();

  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState<string>("");

  const [result, setResult] = useState<TdeeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!activityLevel) {
      setError("Please select an activity level.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/calculator/tdee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(age),
          sex,
          weight: Number(weight),
          height: Number(height),
          activityLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data);
      window.localStorage.setItem(DAILY_GOAL_KEY, String(data.tdee));
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-8 max-w-2xl mx-auto">
      <Undo2
        className="cursor-pointer mb-5 text-white"
        onClick={() => router.back()}
      />
      <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
        Calorie <span className="title_colored">Calculator</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Estimate your daily calorie needs (TDEE) using the Mifflin-St Jeor
        formula.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              min={10}
              max={120}
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Sex</Label>
            <RadioGroup
              value={sex}
              onValueChange={(value) => setSex(value as "male" | "female")}
              className="flex items-center gap-6 h-9"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="male" id="sex-male" />
                <Label htmlFor="sex-male" className="font-normal">
                  Male
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="female" id="sex-female" />
                <Label htmlFor="sex-female" className="font-normal">
                  Female
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              min={1}
              step="0.1"
              required
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="activity-level">Activity level</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger id="activity-level" className="w-full">
                <SelectValue placeholder="Select your activity level" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Calculating..." : "Calculate"}
        </Button>
      </form>

      {error && (
        <p className="mt-6 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-inner">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Basal Metabolic Rate (BMR)
            </p>
            <p className="text-2xl font-semibold">{result.bmr} cal/day</p>
          </div>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Total Daily Energy Expenditure (TDEE)
            </p>
            <p className="text-3xl font-bold">{result.tdee} cal/day</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Suggested macro split
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <span className="colorInfo protein"></span>
                Protein: <span className="font-medium ml-1">{result.macros.protein} g</span>
              </div>
              <div className="flex items-center">
                <span className="colorInfo carbohydrates"></span>
                Carbs: <span className="font-medium ml-1">{result.macros.carbohydrates} g</span>
              </div>
              <div className="flex items-center">
                <span className="colorInfo fat"></span>
                Fat: <span className="font-medium ml-1">{result.macros.fat} g</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
