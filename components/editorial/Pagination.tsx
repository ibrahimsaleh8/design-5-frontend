import { Pagination as PaginationType } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type Props = {
  pagination: PaginationType;
  buildHref: (page: number) => string;
};

export default function Pagination({ pagination, buildHref }: Props) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="التصفح بين الصفحات"
      className="flex items-center justify-center gap-4 mt-10">
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-lg)] border border-[var(--border-light)] text-sm font-semibold text-[var(--text-body)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          السابق
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-lg)] border border-[var(--border-light)] text-sm font-semibold text-[var(--text-muted)] opacity-50 cursor-not-allowed">
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          السابق
        </span>
      )}

      <span className="text-sm text-[var(--text-muted)] tabular-nums">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-lg)] border border-[var(--border-light)] text-sm font-semibold text-[var(--text-body)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
          التالي
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-lg)] border border-[var(--border-light)] text-sm font-semibold text-[var(--text-muted)] opacity-50 cursor-not-allowed">
          التالي
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
