import ArticleGrid from "@/components/editorial/ArticleGrid";
import CategoryPills from "@/components/editorial/CategoryPills";
import HeroFeatured from "@/components/editorial/HeroFeatured";
import NewsletterBlock from "@/components/editorial/NewsletterBlock";
import TrendingList from "@/components/editorial/TrendingList";
import { APP_URL } from "@/lib/ProjectId";
import { Article, Category, HomepageCategory, SiteSettings } from "@/lib/types";

async function getHomeData() {
  try {
    const [settingsRes, homepageRes, latestRes, categoriesRes] =
      await Promise.all([
        fetch(`${APP_URL}/api/settings`, { cache: "force-cache" }),
        fetch(`${APP_URL}/api/articles/homepage?limit=6`, {
          cache: "force-cache",
        }),
        fetch(`${APP_URL}/api/articles?limit=10&sort=createdAt:desc`, {
          cache: "force-cache",
        }),
        fetch(`${APP_URL}/api/categories`, { cache: "force-cache" }),
      ]);

    const settings: SiteSettings | null = settingsRes.ok
      ? (await settingsRes.json()).data
      : null;

    const homepageCategories: HomepageCategory[] = homepageRes.ok
      ? (await homepageRes.json()).data
      : [];

    const fetchedLatest: Article[] = latestRes.ok
      ? (await latestRes.json()).data
      : [];

    const categories: Category[] = categoriesRes.ok
      ? (await categoriesRes.json()).data
      : [];

    const articles = fetchedLatest.length > 0 ? fetchedLatest : [];

    return { settings, homepageCategories, articles, categories };
  } catch {
    return {
      settings: null,
      homepageCategories: [],
      articles: [],
      categories: [],
    };
  }
}

function getFeaturedArticle(
  homepageCategories: HomepageCategory[],
  articles: Article[],
): Article | null {
  for (const cat of homepageCategories) {
    if (cat.articles?.length > 0) return cat.articles[0];
  }
  return articles[0] ?? null;
}

function getGridArticles(
  featured: Article | null,
  homepageCategories: HomepageCategory[],
  articles: Article[],
): Article[] {
  const homepageArticles = homepageCategories.flatMap((cat) => cat.articles);
  const combined = [...homepageArticles, ...articles];
  const seen = new Set<string>();
  const unique: Article[] = [];

  for (const article of combined) {
    if (seen.has(article.id)) continue;
    seen.add(article.id);
    if (featured && article.id === featured.id) continue;
    unique.push(article);
  }

  return unique;
}

export default async function HomePage() {
  const { homepageCategories, articles, categories } = await getHomeData();

  const featured = getFeaturedArticle(homepageCategories, articles);
  const gridArticles = getGridArticles(featured, homepageCategories, articles);
  const trendingArticles = articles.slice(0, 4);

  return (
    <>
      {featured && <HeroFeatured article={featured} />}

      <section className="site-container pb-8 md:pb-12 mt-5">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <CategoryPills categories={categories} />

            <ArticleGrid articles={gridArticles.slice(0, 9)} />
          </div>

          <div className="lg:w-72 xl:w-80 shrink-0">
            <TrendingList articles={trendingArticles} />
          </div>
        </div>
      </section>

      <NewsletterBlock />
    </>
  );
}
