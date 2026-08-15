import { APP_URL } from "@/lib/ProjectId";
import { Category } from "@/lib/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AiArticlesManager, { AiArticle } from "./_components/AiArticlesManager";

export const metadata = {
  title: "مقالات الذكاء الاصطناعي — لوحة التحكم",
  description: "توليد وتحسين وتعديل المقالات باستخدام الذكاء الاصطناعي",
};

export default async function AiArticlesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/login");
  }

  const [articlesRes, categoriesRes] = await Promise.all([
    fetch(`${APP_URL}/api/admin/articles?limit=100`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token.value}` },
    }),
    fetch(`${APP_URL}/api/admin/categories`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token.value}` },
    }),
  ]);

  const articlesJson = articlesRes.ok ? await articlesRes.json() : null;
  const categoriesJson = categoriesRes.ok ? await categoriesRes.json() : null;

  const articlesData: AiArticle[] = Array.isArray(articlesJson?.data)
    ? articlesJson.data
    : Array.isArray(articlesJson)
      ? articlesJson
      : [];

  const categoriesData: Category[] = Array.isArray(categoriesJson?.data)
    ? categoriesJson.data
    : Array.isArray(categoriesJson)
      ? categoriesJson
      : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
              <circle cx="7.5" cy="14.5" r="1.5" />
              <circle cx="16.5" cy="14.5" r="1.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#332822]">
            مقالات الذكاء الاصطناعي
          </h1>
        </div>
        <p className="text-sm text-[#8B7D72] mt-1 mr-12">
          توليد وتحسين وتعديل المقالات تلقائياً باستخدام الذكاء الاصطناعي —
          جميع المحتويات بالعربية وموجّهة للجمهور السعودي.
        </p>
      </div>

      <AiArticlesManager
        initialArticles={articlesData}
        categories={categoriesData}
        token={token.value}
      />
    </div>
  );
}
