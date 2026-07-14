import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toToman(value: number) {
  return new Intl.NumberFormat("fa-IR").format(Math.round(value)) + " تومان";
}

export function toRial(value: number) {
  return new Intl.NumberFormat("fa-IR").format(Math.round(value * 10)) + " ریال";
}

export function faDigits(value: number | string) {
  const map: Record<string, string> = {
    "0": "۰", "1": "۱", "2": "۲", "3": "۳", "4": "۴",
    "5": "۵", "6": "۶", "7": "۷", "8": "۸", "9": "۹",
  };
  return String(value).replace(/[0-9]/g, (d) => map[d]);
}
