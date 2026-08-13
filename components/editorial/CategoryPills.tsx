import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Cpu,
  Globe,
  Grid3X3,
  Lightbulb,
  Users,
} from "lucide-react";
import Link from "next/link";

type Props = {
  categories: Category[];
  activeSlug?: string;
  basePath?: string;
  searchQuery?: string;
};

const CATEGORY_ICONS = [
  Grid3X3,
  BookOpen,
  Cpu,
  Users,
  Globe,
  Lightbulb,
];

function getCategoryIcon(index: number) {
  return CATEGORY_ICONS[index % CATEGORY_ICONS.length];
}

export default function CategoryPills({
  categories,
  activeSlug,
  basePath = "/",
  searchQuery,
}: Props) {
  const isAllActive = !activeSlug;

  function buildCategoryHref(slug: string) {
    if (searchQuery !== undefined) {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      params.set("category", slug);
      return `/search?${params.toString()}`;
    }
    return `/category/${slug}`;
  }

  function buildAllHref() {
    if (searchQuery !== undefined) {
      if (searchQuery) {
        return `/search?q=${encodeURIComponent(searchQuery)}`;
      }
      return "/search";
    }
    return basePath;
  }

  return (
    <nav
      aria-label="تصفية الأقسام"
      className="flex flex-wrap gap-2 md:gap-3">
      <Link
        href={buildAllHref()}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)] text-sm font-semibold transition-all",
          isAllActive
            ? "bg-[var(--primary)] text-white shadow-sm"
            : "bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-body)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
        )}>
        <Grid3X3 className="w-4 h-4" aria-hidden="true" />
        الكل
      </Link>

      {categories.map((category, index) => {
        const Icon = getCategoryIcon(index + 1);
        const isActive = activeSlug === category.slug;

        return (
          <Link
            key={category.id}
            href={buildCategoryHref(category.slug)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)] text-sm font-semibold transition-all",
              isActive
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-body)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
            )}>
            <Icon className="w-4 h-4" aria-hidden="true" />
            {category.title}
          </Link>
        );
      })}
    </nav>
  );
}
