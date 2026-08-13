import ArticleMeta from "@/components/editorial/ArticleMeta";
import CategoryBadge from "@/components/editorial/CategoryBadge";
import { getArticleExcerpt } from "@/lib/format";
import { Article } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

type Props = {
  article: Article;
};

export default function HeroFeatured({ article }: Props) {
  const coverUrl = article.coverImageUrl ?? "/window.svg";
  const excerpt = getArticleExcerpt(article, 160);

  return (
    <section className="site-container py-6 md:py-8 mt-5">
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6 lg:gap-10 items-center">
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          {article.category && (
            <CategoryBadge
              title={article.category.title}
              slug={article.category.slug}
            />
          )}

          <Link href={`/${article.slug}`} className="group">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--text-heading)] leading-tight group-hover:text-[var(--primary)] transition-colors accent-underline">
              {article.title}
            </h1>
          </Link>

          <p className="text-[var(--text-body)] text-base md:text-lg leading-relaxed">
            {excerpt}
          </p>

          <ArticleMeta
            date={article.createdAt}
            content={article.content}
            className="mt-1"
          />
        </div>

        <Link
          href={`/${article.slug}`}
          className="relative img-zoom-container rounded-[var(--radius-xl)] overflow-hidden aspect-[4/3] lg:aspect-[16/11] order-1 lg:order-2 card-hover block">
          <Image
            src={coverUrl}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </Link>
      </div>
    </section>
  );
}
