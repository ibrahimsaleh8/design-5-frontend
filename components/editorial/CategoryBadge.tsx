import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  title: string;
  slug?: string;
  variant?: "mint" | "warm" | "outline";
  className?: string;
};

export default function CategoryBadge({
  title,
  slug,
  variant = "mint",
  className,
}: Props) {
  const styles = {
    mint: "bg-[var(--bg-tag)] text-[var(--text-primary)]",
    warm: "bg-[var(--bg-tag-warm)] text-[var(--primary)]",
    outline:
      "bg-transparent border border-[var(--border-light)] text-[var(--text-body)]",
  };

  const badge = (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-[var(--radius-full)] text-xs font-semibold",
        styles[variant],
        className,
      )}>
      {title}
    </span>
  );

  if (slug) {
    return (
      <Link href={`/category/${slug}`} className="hover:opacity-80 transition-opacity">
        {badge}
      </Link>
    );
  }

  return badge;
}
