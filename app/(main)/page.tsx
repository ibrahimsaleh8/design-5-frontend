import ArticleGrid from "@/components/editorial/ArticleGrid";
import CategoryPills from "@/components/editorial/CategoryPills";
import HeroFeatured from "@/components/editorial/HeroFeatured";
import NewsletterBlock from "@/components/editorial/NewsletterBlock";
import TrendingList from "@/components/editorial/TrendingList";
import { APP_URL } from "@/lib/ProjectId";
import {
  Article,
  Category,
  CustomSection,
  HomepageCategory,
  SiteSettings,
} from "@/lib/types";

async function getHomeData() {
  try {
    const [
      settingsRes,
      homepageRes,
      latestRes,
      categoriesRes,
      customSectionsRes,
    ] = await Promise.all([
      fetch(`${APP_URL}/api/settings`, { cache: "force-cache" }),
      fetch(`${APP_URL}/api/articles/homepage?limit=16`, {
        cache: "force-cache",
      }),
      fetch(`${APP_URL}/api/articles?limit=16&sort=createdAt:desc`, {
        cache: "force-cache",
      }),
      fetch(`${APP_URL}/api/categories`, { cache: "force-cache" }),
      fetch(`${APP_URL}/api/custom-sections`),
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
    const customSectionsJson = customSectionsRes.ok
      ? await customSectionsRes.json()
      : null;

    const customSections: CustomSection[] = Array.isArray(
      customSectionsJson?.data,
    )
      ? customSectionsJson.data
      : Array.isArray(customSectionsJson)
        ? customSectionsJson
        : [];
    const articles = fetchedLatest.length > 0 ? fetchedLatest : [];

    return {
      settings,
      homepageCategories,
      articles,
      categories,
      customSections,
    };
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
  const { homepageCategories, articles, categories, customSections } =
    await getHomeData();
  const featured = getFeaturedArticle(homepageCategories, articles);

  return (
    <>
      {featured && <HeroFeatured article={featured} />}

      <section className="site-container pb-8 md:pb-12 my-5">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <CategoryPills categories={categories} />

            <ArticleGrid articles={articles.slice(0, 9)} />
          </div>

          <div className="lg:w-72 xl:w-80 shrink-0">
            <TrendingList articles={articles.slice(9)} />
          </div>
        </div>
      </section>

      {customSections && customSections.length > 0 && (
        <div className="space-y-8 pt-4 container mx-auto">
          {customSections.map((section) => (
            <section key={section.id} className="custom-section p-6 md:p-8 ">
              <div
                className="article-content text-[#1a1a1a] leading-relaxed overflow-hidden"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </section>
          ))}
        </div>
      )}
    </>
  );
}
