import ArticleMeta from "@/components/editorial/ArticleMeta";
import { Article } from "@/lib/types";
import { Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  articles: Article[];
};

export default function RelatedArticles({ articles }: Props) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-light)]">
      <h2 className="text-xl font-bold text-[var(--text-heading)] mb-6">
        مقالات ذات صلة
      </h2>

      <div className="flex flex-col gap-4">
        {articles.map((article) => {
          const coverUrl = article.coverImageUrl ?? "/window.svg";

          return (
            <Link
              key={article.id}
              href={`/${article.slug}`}
              className="group flex gap-4 p-3 rounded-[var(--radius-lg)] border border-[var(--border-light)] hover:border-[var(--primary)] card-hover">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[var(--radius-md)] overflow-hidden shrink-0 img-zoom-container">
                <Image
                  src={coverUrl}
                  alt={article.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col justify-center gap-1.5 min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[var(--text-heading)] leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                  {article.title}
                </h3>
                <ArticleMeta
                  date={article.createdAt}
                  content={article.content}
                  showIcon={false}
                  className="text-xs"
                />
              </div>

              <span
                className="self-center text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors shrink-0"
                aria-hidden="true">
                <Bookmark className="w-4 h-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
