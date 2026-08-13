import ArticleMeta from "@/components/editorial/ArticleMeta";
import CategoryBadge from "@/components/editorial/CategoryBadge";
import { Article } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  article: Article;
  priority?: boolean;
};

export default function ArticleCard({ article, priority = false }: Props) {
  const coverUrl = article.coverImageUrl ?? "/window.svg";

  return (
    <article className="group">
      <Link
        href={`/${article.slug}`}
        className="flex flex-col h-full rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border-light)] overflow-hidden card-hover">
        <div className="relative img-zoom-container aspect-[16/10]">
          <Image
            src={coverUrl}
            alt={article.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
          {article.category && (
            <div className="absolute top-3 start-3">
              <CategoryBadge title={article.category.title} variant="warm" />
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-4 gap-3">
          <h3 className="text-base font-bold text-[var(--text-heading)] leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
            {article.title}
          </h3>

          <div className="mt-auto flex items-center justify-between gap-3">
            <ArticleMeta
              date={article.createdAt}
              content={article.content}
              showIcon={false}
            />
            <span
              className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border-light)] text-[var(--text-muted)] group-hover:border-[var(--primary)] group-hover:text-[var(--primary)] group-hover:bg-[var(--primary-light)] transition-all shrink-0"
              aria-hidden="true">
              <ArrowLeft className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
