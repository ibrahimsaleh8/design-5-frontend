"use client";

import { useState } from "react";
import Image from "next/image";
import { APP_URL } from "@/lib/ProjectId";
import ArticleEditor from "./ArticleEditor";
import { Category } from "@/lib/types";
import KeywordTagManager from "@/app/(Dashboard)/_components/KeywordTagManager";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import ArticleImagesModal, { ArticleImage } from "./ArticleImagesModal";
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
  images?: ArticleImage[];
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
  /* AI keyword generation */
  const [seedKeyword, setSeedKeyword] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* images modal */
  const [imagesModalArticle, setImagesModalArticle] =
    useState<DashboardArticle | null>(null);

  /* images for new article creation */
  const [createImages, setCreateImages] = useState<ArticleImage[]>([]);
  const [isCreateImagesModalOpen, setIsCreateImagesModalOpen] = useState(false);

  /* ---------------- helpers ---------------- */

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("<p></p>");
    setCoverImageUrl(null);
    setCoverImageId(null);
    setCategoryId("");
    setKeywords([]);
    setCreateImages([]);
  };
  /* ---------------- AI keyword generation ---------------- */

  const handleGenerateKeywords = async () => {
    const trimmedTitle = title.trim();
    // Strip HTML tags from content to get plain text length check
    const plainContent = content.replace(/<[^>]*>/g, "").trim();

    if (!trimmedTitle) {
      setAiError("يجب إدخال عنوان المقال أولاً قبل توليد الكلمات المفتاحية.");
      return;
    }
    if (!plainContent) {
      setAiError("يجب إدخال محتوى المقال أولاً قبل توليد الكلمات المفتاحية.");
      return;
    }

    setGenerating(true);
    setAiError(null);
    setAiSuggestions(null);

    try {
      const payload: { title: string; content: string; keyword?: string } = {
        title: trimmedTitle,
        content,
      };
      const trimmedSeed = seedKeyword.trim();
      if (trimmedSeed) payload.keyword = trimmedSeed;

      const res = await fetch(`${APP_URL}/api/v1/seo/article-keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "فشل توليد الكلمات المفتاحية");

      const list: string[] = Array.isArray(json.data?.keywords)
        ? json.data.keywords
        : [];
      if (list.length === 0) {
        setAiError("لم يتم إنتاج أي كلمات مفتاحية. حاول مجدداً.");
        return;
      }
      setAiSuggestions(list);
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : "حدث خطأ أثناء الاتصال بالخادم",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleAddAllAiKeywords = () => {
    if (!aiSuggestions) return;
    const merged = Array.from(new Set([...keywords, ...aiSuggestions]));
    setKeywords(merged);
    setAiSuggestions(null);
  };

  const handleAddSingleAiKeyword = (kw: string) => {
    if (!keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
    }
    setAiSuggestions((prev) => prev?.filter((k) => k !== kw) ?? null);
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
        ...(!editingId && createImages.length > 0
          ? {
              images: createImages.map((img) => ({
                imageUrl: img.imageUrl,
                ...(img.alt ? { alt: img.alt } : {}),
              })),
            }
          : {}),
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
          {/* AI Keyword Generator for Article */}
          <div
            className="bg-linear-to-r from-purple-50/80 via-indigo-50/50 to-purple-50/80 border border-purple-200/90 rounded-2xl p-4 space-y-3"
            dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  توليد كلمات مفتاحية بالذكاء الاصطناعي
                </h4>
                <p className="text-[11px] text-gray-500">
                  يستخدم عنوان ومحتوى المقال لتوليد كلمات SEO عربية مناسبة
                </p>
              </div>
            </div>

            {/* Input + Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="كلمة مفتاحية بذرية (اختياري) مثل: عناية بالبشرة..."
                  value={seedKeyword}
                  onChange={(e) => setSeedKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleGenerateKeywords();
                    }
                  }}
                  disabled={generating}
                  className="bg-white border-purple-200 text-xs sm:text-sm pr-3 text-right placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-purple-400 h-10"
                  dir="rtl"
                />
                {seedKeyword && (
                  <button
                    type="button"
                    onClick={() => setSeedKeyword("")}
                    disabled={generating}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
                    title="مسح">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerateKeywords}
                disabled={
                  generating ||
                  !title.trim() ||
                  !content.replace(/<[^>]*>/g, "").trim()
                }
                title={
                  !title.trim()
                    ? "أدخل عنوان المقال أولاً"
                    : !content.replace(/<[^>]*>/g, "").trim()
                      ? "أدخل محتوى المقال أولاً"
                      : "توليد الكلمات المفتاحية"
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                style={{
                  background: generating
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
                }}>
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التوليد...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>توليد الكلمات</span>
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {aiError && !generating && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start justify-between gap-3 text-right">
                <p className="text-xs text-red-700 leading-relaxed font-medium">
                  {aiError}
                </p>
                <button
                  type="button"
                  onClick={() => setAiError(null)}
                  className="text-red-400 hover:text-red-700 p-0.5 rounded transition-colors shrink-0"
                  title="إغلاق">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Suggestions Panel */}
            {aiSuggestions !== null && (
              <div className="border border-purple-200 bg-white rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-purple-900">
                      الكلمات المقترحة
                    </span>
                    <span className="text-[11px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {aiSuggestions.length} كلمة
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiSuggestions(null)}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                    إغلاق
                  </button>
                </div>

                {/* Keyword chips */}
                <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
                  {aiSuggestions.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-950 font-medium hover:border-purple-400 transition-all">
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleAddSingleAiKeyword(kw)}
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
                        title="إضافة">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add all */}
                {aiSuggestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddAllAiKeywords}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-all w-full justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    }}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      إضافة جميع الكلمات المقترحة ({aiSuggestions.length})
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Cover Image Upload */}
        <ImageUploader
          token={token}
          value={coverImageUrl}
          onChange={(url) => setCoverImageUrl(url || null)}
          label="صورة الغلاف (اختياري)"
          placeholder="انقر أو اسحب لإضافة صورة الغلاف"
        />

        {/* Additional Article Images (Create / Edit) */}
        <div className="space-y-2 border border-dashed border-[#e8ddd4] bg-[#fdfaf7] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-[#6B4E2F] block">
                صور المقال الإضافية (اختياري)
              </label>
              <p className="text-[11px] text-[#8B7D72]">
                {editingId
                  ? "يمكنك إدارة صور المقال عبر النافذة المنبثقة"
                  : "أضف صوراً مخصصة مع النص البديل (alt) ليتم إرفاقها عند إنشاء المقال"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (editingId) {
                  const currentArt = articles.find((a) => a.id === editingId);
                  if (currentArt) setImagesModalArticle(currentArt);
                } else {
                  setIsCreateImagesModalOpen(true);
                }
              }}
              className="text-xs bg-[#f0e8e0] text-[#6B4E2F] hover:bg-[#e4d7cc] px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5">
              <ImagePlus className="w-4 h-4" />
              {editingId
                ? "إدارة الصور"
                : createImages.length > 0
                  ? `تعديل الصور (${createImages.length})`
                  : "إضافة صور"}
            </button>
          </div>

          {!editingId && createImages.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {createImages.map((img) => (
                <div
                  key={img.id}
                  className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#d4c4b5] group"
                  title={img.alt || "صورة المقال"}>
                  <Image
                    src={img.imageUrl}
                    alt={img.alt || "صورة"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {img.alt && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5">
                      <p className="text-[9px] text-white truncate text-right">
                        {img.alt}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
                    type="button"
                    onClick={() => setImagesModalArticle(article)}
                    className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-[#d4c4b5] text-[#6B4E2F] hover:bg-[#f0e8e0] transition-colors">
                    الصور
                    {(article.images?.length ?? 0) > 0 && (
                      <span className="mr-1 text-[10px] bg-[#f0e8e0] text-[#6B4E2F] px-1.5 py-0.5 rounded-full font-medium">
                        {article.images!.length}
                      </span>
                    )}
                  </button>
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

      {/* Article Images Modal (Existing Article) */}
      {imagesModalArticle && (
        <ArticleImagesModal
          open={!!imagesModalArticle}
          onClose={() => setImagesModalArticle(null)}
          articleId={imagesModalArticle.id}
          token={token}
          initialImages={imagesModalArticle.images ?? []}
          onImagesChange={(imgs) => {
            setImagesModalArticle((prev) =>
              prev ? { ...prev, images: imgs } : null,
            );
            setArticles((prev) =>
              prev.map((a) =>
                a.id === imagesModalArticle.id ? { ...a, images: imgs } : a,
              ),
            );
          }}
        />
      )}

      {/* Article Images Modal (New Article Creation) */}
      {isCreateImagesModalOpen && (
        <ArticleImagesModal
          open={isCreateImagesModalOpen}
          onClose={() => setIsCreateImagesModalOpen(false)}
          token={token}
          initialImages={createImages}
          onImagesChange={setCreateImages}
        />
      )}
    </div>
  );
}
