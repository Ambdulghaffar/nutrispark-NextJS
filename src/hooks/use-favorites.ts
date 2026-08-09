"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "nutrispark:favorites";
const CHANGE_EVENT = "nutrispark:favorites-changed";

let cachedRaw: string | null = null;
let cachedSnapshot: string[] = [];

function readFromStorage(): string[] {
  if (typeof window === "undefined") return cachedSnapshot;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;

  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedSnapshot = Array.isArray(parsed) ? parsed : [];
  } catch {
    cachedSnapshot = [];
  }
  return cachedSnapshot;
}

function writeToStorage(slugs: string[]) {
  cachedRaw = JSON.stringify(slugs);
  cachedSnapshot = slugs;
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

const SERVER_SNAPSHOT: string[] = [];

function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribe,
    readFromStorage,
    getServerSnapshot
  );

  const toggle = useCallback((slug: string) => {
    const current = readFromStorage();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];
    writeToStorage(next);
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
