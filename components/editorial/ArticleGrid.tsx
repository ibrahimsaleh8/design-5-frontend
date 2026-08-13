import ArticleCard from "@/components/editorial/ArticleCard";
import { Article } from "@/lib/types";

type Props = {
  articles: Article[];
  emptyMessage?: string;
};

export default function ArticleGrid({
  articles,
  emptyMessage = "لا توجد مقالات متاحة حالياً.",
}: Props) {
  if (articles.length === 0) {
    return (
      <div className="col-span-full py-16 text-center">
        <p className="text-[var(--text-muted)] text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {articles.map((article, index) => (
        <ArticleCard
          key={article.id}
          article={article}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
