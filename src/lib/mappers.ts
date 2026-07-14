import type { Category as PrismaCategory, Karat as PrismaKarat } from "@prisma/client";
import type { CategorySlug, Karat } from "@/types";

export const categoryToSlug: Record<PrismaCategory, CategorySlug> = {
  RINGS: "rings",
  NECKLACES: "necklaces",
  BRACELETS: "bracelets",
  EARRINGS: "earrings",
  SETS: "sets",
  COINS: "coins",
};

export const slugToCategory: Record<CategorySlug, PrismaCategory> = {
  rings: "RINGS",
  necklaces: "NECKLACES",
  bracelets: "BRACELETS",
  earrings: "EARRINGS",
  sets: "SETS",
  coins: "COINS",
};

export const karatToNumber: Record<PrismaKarat, Karat> = {
  K18: 18,
  K21: 21,
  K24: 24,
};

export const numberToKarat: Record<Karat, PrismaKarat> = {
  18: "K18",
  21: "K21",
  24: "K24",
};
