import ArticleGrid from "@/components/editorial/ArticleGrid";
import Breadcrumbs from "@/components/editorial/Breadcrumbs";
import CategoryPills from "@/components/editorial/CategoryPills";
import Pagination from "@/components/editorial/Pagination";
import SearchForm from "@/components/editorial/SearchForm";
import { APP_URL } from "@/lib/ProjectId";
import { Article, Category, Pagination as PaginationType } from "@/lib/types";
import { Metadata } from "next";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `نتائج البحث عن "${q}" | المقالات` : "البحث في المقالات",
    description: "ابحث في جميع المقالات والتحليلات والأفكار المطروحة في المجلة",
  };
}

async function getSearchData(
  query: string,
  category: string,
  sort: string,
  page: number,
) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: "12",
      sort,
    });
    if (query) params.set("search", query);
    if (category) params.set("category", category);

    const [articlesRes, categoriesRes] = await Promise.all([
      fetch(`${APP_URL}/api/articles?${params.toString()}`, {
        cache: "force-cache",
      }),
      fetch(`${APP_URL}/api/categories`),
    ]);

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

    return { articles, pagination, categories };
  } catch {
    return {
      articles: [],
      pagination: { page, limit: 12, total: 0, totalPages: 1 },
      categories: [],
    };
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const {
    q = "",
    category = "",
    sort = "createdAt:desc",
    page: pageStr = "1",
  } = await searchParams;

  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const { articles, pagination, categories } = await getSearchData(
    q,
    category,
    sort,
    page,
  );

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (sort !== "createdAt:desc") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/search?${qs}` : "/search";
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "الرئيسية", href: "/" },
          { label: q ? `نتائج البحث: ${q}` : "البحث" },
        ]}
      />

      <section className="site-container pb-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-heading)] mb-2 accent-underline">
            {q ? `نتائج البحث عن "${q}"` : "البحث في المقالات"}
          </h1>
          {pagination.total > 0 && (
            <p className="text-[var(--text-muted)] text-sm mt-4">
              {pagination.total} نتيجة
            </p>
          )}
        </div>

        <SearchForm defaultValue={q} variant="page" className="mb-8" />

        {categories.length > 0 && (
          <div className="mb-8">
            <CategoryPills
              categories={categories}
              activeSlug={category}
              searchQuery={q}
            />
          </div>
        )}

        <ArticleGrid
          articles={articles}
          emptyMessage={
            q
              ? `لم يتم العثور على نتائج لـ "${q}"`
              : "ابدأ بالبحث عن المقالات التي تهمك."
          }
        />

        <Pagination pagination={pagination} buildHref={buildHref} />
      </section>
    </>
  );
}
