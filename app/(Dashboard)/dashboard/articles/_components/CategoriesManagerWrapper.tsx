"use client";

import { useState } from "react";
import CategoriesManager from "./CategoriesManager";
import { Category } from "@/lib/types";

export default function CategoriesManagerWrapper({
  initialCategories,
  token,
}: {
  initialCategories: Category[];
  token: string;
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  return (
    <CategoriesManager
      initialCategories={categories}
      onCategoriesChange={setCategories}
      token={token}
    />
  );
}
