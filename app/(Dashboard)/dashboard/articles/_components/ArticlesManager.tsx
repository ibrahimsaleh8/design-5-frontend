"use client";

import { useState } from "react";
import Image from "next/image";
import { APP_URL } from "@/lib/ProjectId";
import ArticleEditor from "./ArticleEditor";
import { Category } from "@/lib/types";
import KeywordTagManager from "@/app/(Dashboard)/_components/KeywordTagManager";
import { Input } from "@/components/ui/input";
import ImageUploader from "@/components/ImageUploader";

// Dashboard-specific article type with new API fields
export type DashboardArticle = {
  id: string;
  title: string;
  slug: string;
  content: string | null; // HTML
  coverImageUrl: string | null;
  coverImageId: string | null;
  keywords: string[];
  categoryId: string | null;
  category?: {
    id: string;
    title: string;
    slug: string;
  } | null;
};

export default function ArticlesManager({
  initialArticles,
  categories,
  token,
}: {
  initialArticles: DashboardArticle[];
  token: string;
  categories: Category[];
}) {
  const [articles, setArticles] = useState<DashboardArticle[]>(initialArticles);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ---------------- helpers ---------------- */

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("<p></p>");
    setCoverImageUrl(null);
    setCoverImageId(null);
    setCategoryId("");
    setKeywords([]);
  };

  /* ---------------- submit ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("عنوان المقال مطلوب");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const finalCoverImageUrl = coverImageUrl;
      const finalCoverImageId = coverImageId;

      const body = {
        title,
        content,
        ...(finalCoverImageUrl ? { coverImageUrl: finalCoverImageUrl } : {}),
        ...(finalCoverImageId ? { coverImageId: finalCoverImageId } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(keywords.length > 0 ? { keywords } : {}),
      };

      const url = editingId
        ? `${APP_URL}/api/admin/articles/${editingId}`
        : `${APP_URL}/api/admin/articles`;

      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed");

      const article: DashboardArticle = json.data || json;

      setArticles((prev) =>
        editingId
          ? prev.map((a) => (a.id === article.id ? article : a))
          : [article, ...prev],
      );

      setSuccess(editingId ? "تم التحديث بنجاح" : "تم الإنشاء بنجاح");
      await fetch("/api/revalidate-metatags");
      resetForm();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء حفظ المقال");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- edit ---------------- */

  const handleEditClick = (article: DashboardArticle) => {
    setEditingId(article.id);
    setTitle(article.title);
    setContent(article.content || "<p></p>");
    setCoverImageUrl(article.coverImageUrl);
    setCoverImageId(article.coverImageId);
    setCategoryId(article.categoryId || "");
    setKeywords(article.keywords || []);
    setError(null);
    setSuccess(null);
  };

  /* ---------------- delete ---------------- */

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${APP_URL}/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("فشل حذف المقال");

      setArticles((prev) => prev.filter((a) => a.id !== id));
      setSuccess("تم حذف المقال بنجاح");
      await fetch("/api/revalidate-metatags");

      if (editingId === id) resetForm();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء حذف المقال");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* Create / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border p-5 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold">
          {editingId ? "تعديل مقال" : "إضافة مقال"}
        </h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        {/* Title */}
        <Input
          placeholder="عنوان المقال"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {/* Category Dropdown */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#8B7D72]">
            التصنيف (اختياري)
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white text-[#332822] focus:outline-none focus:ring-2 focus:ring-[#6B4E2F]/40"
            dir="rtl">
            <option value="">— اختر تصنيفاً —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        {/* Keywords Tag Manager */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#8B7D72]">
            الكلمات المفتاحية
          </label>
          <KeywordTagManager
            keywords={keywords}
            onChange={setKeywords}
            showFooterActions={false}
          />
        </div>
        {/* Cover Image Upload */}
        <ImageUploader
          token={token}
          value={coverImageUrl}
          onChange={(url) => setCoverImageUrl(url || null)}
          label="صورة الغلاف (اختياري)"
          placeholder="انقر أو اسحب لإضافة صورة الغلاف"
        />
        {/* Content Editor */}
        <ArticleEditor content={content} onChange={setContent} token={token} />
        <div className="flex gap-2">
          <button
            disabled={saving}
            className="bg-[#6B4E2F] text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-60">
            {saving
              ? "جارٍ الحفظ..."
              : editingId
                ? "تحديث المقال"
                : "إنشاء المقال"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-md text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50">
              إلغاء
            </button>
          )}
        </div>
      </form>

      {/* List of Articles */}
      <div className="bg-white border p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            كل المقالات ({articles.length})
          </h2>
        </div>

        {articles.length === 0 ? (
          <p className="text-sm text-slate-500">لا توجد مقالات حتى الآن.</p>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-slate-100 rounded-lg px-4 py-3">
                <div className="flex items-start gap-3 max-w-full">
                  {article.coverImageUrl && (
                    <div className="w-16 h-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                      <Image
                        src={article.coverImageUrl}
                        alt={article.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1 max-w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-[#332822]">
                        {article.title}
                      </h3>
                      {article.category && (
                        <span className="text-xs bg-[#f3ede8] text-[#6B4E2F] px-2 py-0.5 rounded-full font-medium shrink-0">
                          {article.category.title}
                        </span>
                      )}
                    </div>
                    {article.content && (
                      <div
                        className="text-xs text-slate-500 line-clamp-3 prose max-w-full"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(article)}
                    className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50">
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="text-xs md:text-sm px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600">
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
