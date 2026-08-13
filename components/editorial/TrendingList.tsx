import ArticleMeta from "@/components/editorial/ArticleMeta";
import { Article } from "@/lib/types";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

type Props = {
  articles: Article[];
  title?: string;
};

export default function TrendingList({
  articles,
  title = "الأكثر تداولاً",
}: Props) {
  if (articles.length === 0) return null;

  return (
    <aside className="rounded-[var(--radius-xl)] bg-[var(--bg-section)] p-5 md:p-6">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
        <h2 className="text-lg font-bold text-[var(--text-heading)]">{title}</h2>
      </div>

      <ol className="flex flex-col gap-5">
        {articles.slice(0, 4).map((article, index) => (
          <li key={article.id} className="flex gap-4 group">
            <span
              className="text-3xl font-bold text-[var(--primary)] leading-none shrink-0 w-8 tabular-nums"
              aria-hidden="true">
              {index + 1}
            </span>
            <div className="flex flex-col gap-1.5 min-w-0">
              <Link
                href={`/${article.slug}`}
                className="text-sm font-bold text-[var(--text-heading)] leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                {article.title}
              </Link>
              <ArticleMeta
                date={article.createdAt}
                content={article.content}
                showIcon={false}
                className="text-xs"
              />
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
