"use client";

import { IFoodReduced, IFood } from "@/types";
import { useRouter } from "next/navigation";

import * as React from "react";
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favorite-button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [foods, setFoods] = useState<IFoodReduced[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchFoods = async () => {
    try {
      const response = await fetch("/api/foods/all");
      const data = await response.json();
      const foodReduced: IFoodReduced[] = data.map((food: IFood) => ({
        value: slugify(food.name),
        label: food.name,
      }));
      setFoods(foodReduced);
    } catch {
      setFoods([]);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchFoods();
      setIsLoading(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    if (value.length > 0) {
      router.push(`/food/${value}`);
    }
  }, [value]);

  return (
    <>
      {!isLoading ? (
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-center">
            Welcome to <span className="title_colored">Nutrispark</span>
          </h1>
          <p className="text-lg mb-8 text-center">
            Discover the nutritional values of your favorite foods. Use the
            search below to gert started.
          </p>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full max-w-[300px] justify-between"
              >
                {value
                  ? foods.find((food) => food.value === value)?.label
                  : "Select food..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-3rem)] max-w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search food..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No food found.</CommandEmpty>
                  <CommandGroup>
                    {foods.map((food) => (
                      <CommandItem
                        key={food.value}
                        value={food.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue);
                          setOpen(false);
                        }}
                      >
                        <span className="truncate">{food.label}</span>
                        <Check
                          className={cn(
                            "ml-auto shrink-0",
                            value === food.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <FavoriteButton
                          slug={food.value}
                          className="ml-1 shrink-0"
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen text-white">
          <p className="text-2xl">Loading...</p>
        </div>
      )}
    </>
  );
}
