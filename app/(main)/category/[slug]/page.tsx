import ArticleGrid from "@/components/editorial/ArticleGrid";
import Breadcrumbs from "@/components/editorial/Breadcrumbs";
import CategoryPills from "@/components/editorial/CategoryPills";
import Pagination from "@/components/editorial/Pagination";
import TrendingList from "@/components/editorial/TrendingList";
import { APP_URL, currentURL } from "@/lib/ProjectId";
import { Article, Category, Pagination as PaginationType } from "@/lib/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getCategoryData(slug: string, page: number) {
  const [categoryRes, articlesRes, categoriesRes, trendingRes] =
    await Promise.all([
      fetch(`${APP_URL}/api/categories/${slug}`, { cache: "force-cache" }),
      fetch(
        `${APP_URL}/api/articles?category=${slug}&page=${page}&limit=12&sort=createdAt:desc`,
        { cache: "force-cache" },
      ),
      fetch(`${APP_URL}/api/categories`, { cache: "force-cache" }),
      fetch(`${APP_URL}/api/articles?limit=4&sort=createdAt:desc`, {
        cache: "force-cache",
      }),
    ]);

  if (!categoryRes.ok) return null;

  const category: Category = (await categoryRes.json()).data;
  const articlesJson = articlesRes.ok ? await articlesRes.json() : null;
  const articles: Article[] = articlesJson?.data ?? [];
  const pagination: PaginationType = articlesJson?.pagination ?? {
    page,
    limit: 12,
    total: 0,
    totalPages: 1,
  };

  const categories: Category[] = categoriesRes.ok
    ? (await categoriesRes.json()).data
    : [];

  const trending: Article[] = trendingRes.ok
    ? (await trendingRes.json()).data
    : [];

  return { category, articles, pagination, categories, trending };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug, 1);
  if (!data) return { title: "القسم غير موجود" };

  return {
    title: `${data.category.title} | المقالات`,
    description: `تصفح جميع مقالات قسم ${data.category.title}`,
    alternates: {
      canonical: `${currentURL}/category/${data.category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const data = await getCategoryData(slug, page);
  if (!data) notFound();

  const { category, articles, pagination, categories, trending } = data;

  const buildHref = (p: number) =>
    p > 1 ? `/category/${slug}?page=${p}` : `/category/${slug}`;

  return (
    <>
      <Breadcrumbs
        items={[{ label: "الرئيسية", href: "/" }, { label: category.title }]}
      />

      <section className="site-container pb-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-heading)] accent-underline">
            {category.title}
          </h1>
          {category._count?.articles !== undefined && (
            <p className="text-[var(--text-muted)] text-sm mt-4">
              {category._count.articles} مقالة
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mb-5">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <CategoryPills categories={categories} activeSlug={slug} />

            <ArticleGrid
              articles={articles}
              emptyMessage={`لا توجد مقالات في قسم ${category.title} حالياً.`}
            />

            <Pagination pagination={pagination} buildHref={buildHref} />
          </div>

          <div className="lg:w-72 xl:w-80 shrink-0">
            <TrendingList articles={trending} />
          </div>
        </div>
      </section>
    </>
  );
}
