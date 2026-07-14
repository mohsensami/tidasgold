import type { Karat as PrismaKarat } from "@prisma/client";
import type { Karat } from "@/types";

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
