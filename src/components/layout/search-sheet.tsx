"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function SearchSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(q)}`);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="جستجو">
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle>جستجوی محصولات</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl gap-2">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثلاً گردنبند طلا، انگشتر..."
            className="flex-1"
          />
          <Button type="submit" variant="gold">
            جستجو
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
