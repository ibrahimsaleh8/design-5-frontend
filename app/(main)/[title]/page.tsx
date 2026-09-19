import ArticleActions from "@/components/editorial/ArticleActions";
import ArticleMeta from "@/components/editorial/ArticleMeta";
import Breadcrumbs from "@/components/editorial/Breadcrumbs";
import CategoryBadge from "@/components/editorial/CategoryBadge";
import RelatedArticles from "@/components/editorial/RelatedArticles";
import { APP_URL, currentURL } from "@/lib/ProjectId";
import { Article } from "@/lib/types";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ title: string }>;
};

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${APP_URL}/api/articles/${slug}`, {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch {
    return null;
  }
}

async function getRelatedArticles(article: Article): Promise<Article[]> {
  if (!article.category?.slug) return [];

  try {
    const res = await fetch(
      `${APP_URL}/api/articles?category=${article.category.slug}&limit=4&sort=createdAt:desc`,
      { cache: "force-cache" },
    );
    if (!res.ok) return [];
    const data: Article[] = (await res.json()).data;
    return data.filter((a) => a.id !== article.id).slice(0, 3);
  } catch {
    return [];
  }
}

async function getAllSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${APP_URL}/api/articles?limit=100`, {
      cache: "force-cache",
    });
    if (!res.ok) return [];
    const data: Article[] = (await res.json()).data;
    return data.map((a) => a.slug);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ title: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { title: slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "المقال غير موجود" };

  return {
    title: `${article.title} | المقالات`,
    description: article.content
      ? article.content.replace(/<[^>]+>/g, "").slice(0, 160)
      : article.title,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      type: "article",
      locale: "ar_SA",
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : [],
      publishedTime: article.createdAt,
    },
    alternates: {
      canonical: `${currentURL}/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { title: slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article);
  const coverUrl = article.coverImageUrl ?? "/window.svg";
  const articleUrl = `${currentURL}/${slug}`;

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    ...(article.category
      ? [
          {
            label: article.category.title,
            href: `/category/${article.category.slug}`,
          },
        ]
      : []),
    { label: article.title },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <article className="site-container pb-12">
        <header className="max-w-3xl mx-auto mb-8">
          {article.category && (
            <div className="mb-4">
              <CategoryBadge
                title={article.category.title}
                slug={article.category.slug}
              />
            </div>
          )}

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--text-heading)] leading-tight mb-4 accent-underline">
            {article.title}
          </h1>

          <ArticleMeta
            date={article.createdAt}
            content={article.content}
            className="mb-6"
          />

          <ArticleActions title={article.title} url={articleUrl} />
        </header>

        <div className="relative rounded-[var(--radius-xl)] overflow-hidden aspect-[16/9] max-w-4xl mx-auto mb-10 img-zoom-container">
          <Image
            src={coverUrl}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        {article.content && (
          <div
            className="article-content max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}
        {/* Article Images Gallery */}
        {article.images && article.images.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8">
            {article.images.map((img) => (
              <div
                key={img.id}
                className="group block overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md transition-all hover:border-gray-200">
                <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={img.imageUrl}
                    alt={img.alt || ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="max-w-3xl mx-auto mb-4">
          <RelatedArticles articles={related} />
        </div>
      </article>
    </>
  );
}
