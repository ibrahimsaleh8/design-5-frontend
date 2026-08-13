"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  defaultValue?: string;
  variant?: "header" | "page";
  className?: string;
};

export default function SearchForm({
  defaultValue = "",
  variant = "header",
  className = "",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/search");
    }
  }

  if (variant === "header") {
    return (
      <form
        onSubmit={handleSubmit}
        className={`relative ${className}`}
        role="search">
        <Search
          className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث"
          aria-label="بحث في المقالات"
          className="w-full sm:w-44 lg:w-52 h-10 ps-9 pe-3 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--bg-section)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
        />
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row gap-3 ${className}`}
      role="search">
      <div className="relative flex-1">
        <Search
          className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في المقالات..."
          aria-label="بحث في المقالات"
          className="w-full h-12 ps-12 pe-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-white text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
        />
      </div>
      <button
        type="submit"
        className="h-12 px-8 rounded-[var(--radius-lg)] bg-[var(--primary)] text-white text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors shrink-0">
        بحث
      </button>
    </form>
  );
}
