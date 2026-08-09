"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { foods } from "@/data";
import { slugify } from "@/lib/utils";

const STORAGE_KEY = "nutrispark:journal";
const CHANGE_EVENT = "nutrispark:journal-changed";

export interface JournalEntry {
  id: string;
  foodSlug: string;
  quantity: number;
  addedAt: number;
}

type JournalData = Record<string, JournalEntry[]>;

export interface JournalTotals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

let cachedRaw: string | null = null;
let cachedSnapshot: JournalData = {};

function readFromStorage(): JournalData {
  if (typeof window === "undefined") return cachedSnapshot;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;

  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    cachedSnapshot =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
  } catch {
    cachedSnapshot = {};
  }
  return cachedSnapshot;
}

function writeToStorage(data: JournalData) {
  cachedRaw = JSON.stringify(data);
  cachedSnapshot = data;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

const SERVER_SNAPSHOT: JournalData = {};

function getServerSnapshot(): JournalData {
  return SERVER_SNAPSHOT;
}

function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useJournal() {
  const journal = useSyncExternalStore(
    subscribe,
    readFromStorage,
    getServerSnapshot
  );
  const todayKey = getTodayKey();

  const entries = useMemo(
    () => journal[todayKey] ?? [],
    [journal, todayKey]
  );

  const addEntry = useCallback((foodSlug: string, quantity: number) => {
    const current = readFromStorage();
    const key = getTodayKey();
    const dayEntries = current[key] ?? [];
    const newEntry: JournalEntry = {
      id: createEntryId(),
      foodSlug,
      quantity,
      addedAt: Date.now(),
    };
    writeToStorage({ ...current, [key]: [...dayEntries, newEntry] });
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    const current = readFromStorage();
    const key = getTodayKey();
    const dayEntries = current[key] ?? [];
    writeToStorage({
      ...current,
      [key]: dayEntries.filter((entry) => entry.id !== entryId),
    });
  }, []);

  const totals = useMemo<JournalTotals>(() => {
    return entries.reduce<JournalTotals>(
      (acc, entry) => {
        const food = foods.find((item) => slugify(item.name) === entry.foodSlug);
        if (!food) return acc;
        const factor = entry.quantity / 100;
        return {
          calories: acc.calories + food.calories * factor,
          protein: acc.protein + food.protein * factor,
          carbohydrates: acc.carbohydrates + food.carbohydrates * factor,
          fat: acc.fat + food.fat * factor,
        };
      },
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
    );
  }, [entries]);

  return { entries, addEntry, removeEntry, totals };
}
