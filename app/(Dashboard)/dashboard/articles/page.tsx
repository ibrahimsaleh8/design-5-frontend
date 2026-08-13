import { APP_URL } from "@/lib/ProjectId";
import ArticlesManager, {
  DashboardArticle,
} from "./_components/ArticlesManager";
import { Category } from "@/lib/types";
import CategoriesManagerWrapper from "./_components/CategoriesManagerWrapper";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ArticlesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/login");
  }

  const [articlesRes, categoriesRes] = await Promise.all([
    fetch(`${APP_URL}/api/admin/articles?limit=100`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    }),
    fetch(`${APP_URL}/api/admin/categories`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    }),
  ]);

  const articlesJson = articlesRes.ok ? await articlesRes.json() : null;
  const categoriesJson = categoriesRes.ok ? await categoriesRes.json() : null;

  const articlesData: DashboardArticle[] = Array.isArray(articlesJson?.data)
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#332822]">المقالات</h1>
          <p className="text-sm text-[#8B7D72] mt-1">
            إنشاء وتعديل وحذف المقالات في موقعك.
          </p>
        </div>
      </div>

      {/* Articles Section */}
      <ArticlesManager
        initialArticles={articlesData}
        categories={categoriesData}
        token={token.value}
      />

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Categories Section Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[#332822]">إدارة التصنيفات</h2>
        <p className="text-sm text-[#8B7D72]">
          أضف وعدّل تصنيفات المقالات لتنظيم محتوى موقعك.
        </p>
      </div>

      <CategoriesManagerWrapper
        initialCategories={categoriesData}
        token={token.value}
      />
    </div>
  );
}
