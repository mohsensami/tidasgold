import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/data/products";
import { getGoldPrice } from "@/lib/data/settings";
import { calculateGoldPrice } from "@/lib/price";
import { DatabaseUnavailableError } from "@/lib/db-retry";

export async function GET() {
  try {
    const [products, goldPrice] = await Promise.all([getAllProducts(), getGoldPrice()]);

    const withPrice = products.map((p) => ({
      ...p,
      finalPrice: calculateGoldPrice(p, goldPrice.pricePerGram18k).total,
    }));

    return NextResponse.json(withPrice);
  } catch (err) {
    const isDbError = err instanceof DatabaseUnavailableError;
    return NextResponse.json(
      { error: isDbError ? err.message : "خطای غیرمنتظره" },
      { status: 503 }
    );
  }
}
