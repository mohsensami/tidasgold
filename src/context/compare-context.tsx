"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "talagold-compare";
const MAX_COMPARE = 4;

interface CompareContextValue {
  ids: string[];
  isComparing: (productId: string) => boolean;
  toggleCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // نادیده گرفتن خطای ذخیره (مثلاً حالت خصوصی مرورگر)
    }
  }, [ids, ready]);

  function isComparing(productId: string) {
    return ids.includes(productId);
  }

  function toggleCompare(productId: string) {
    setIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= MAX_COMPARE) {
        toast.error(`حداکثر ${MAX_COMPARE} محصول را می‌توان هم‌زمان مقایسه کرد`);
        return prev;
      }
      return [...prev, productId];
    });
  }

  function removeFromCompare(productId: string) {
    setIds((prev) => prev.filter((id) => id !== productId));
  }

  function clearCompare() {
    setIds([]);
  }

  return (
    <CompareContext.Provider value={{ ids, isComparing, toggleCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare باید داخل CompareProvider استفاده شود");
  return ctx;
}
