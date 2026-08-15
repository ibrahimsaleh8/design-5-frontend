"use client";

import { useState } from "react";
import Image from "next/image";
import { APP_URL } from "@/lib/ProjectId";
import { Input } from "@/components/ui/input";
import { Category } from "@/lib/types";
import ArticleEditor from "../../articles/_components/ArticleEditor";
import KeywordTagManager from "@/app/(Dashboard)/_components/KeywordTagManager";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type AiArticle = {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  content: string | null;
  coverImageUrl: string | null;
  coverImageId: string | null;
  keywords: string[];
  status: "DRAFT" | "PUBLISHED";
  categoryId: string | null;
  category?: { id: string; title: string; slug: string } | null;
};

/* ------------------------------------------------------------------ */
/*  Small helpers                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${status === "PUBLISHED"
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-400"}`}
      />
      {status === "PUBLISHED" ? "منشور" : "مسودة"}
    </span>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${gradient}`}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-[#1C1917]">{title}</h2>
        <p className="text-xs text-[#8B7D72] mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function AlertBanner({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  return (
    <div
      className={`flex items-start gap-2 px-4 py-3 rounded-lg text-sm font-medium ${type === "error"
        ? "bg-red-50 border border-red-200 text-red-700"
        : "bg-emerald-50 border border-emerald-200 text-emerald-700"
        }`}
    >
      <span className="mt-0.5 shrink-0">
        {type === "error" ? "✗" : "✓"}
      </span>
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export default function AiArticlesManager({
  initialArticles,
  categories,
  token,
}: {
  initialArticles: AiArticle[];
  categories: Category[];
  token: string;
}) {
  const [articles, setArticles] = useState<AiArticle[]>(initialArticles);

  /* ---- Section A: Generate ---- */
  const [genTitle, setGenTitle] = useState("");
  const [genDescription, setGenDescription] = useState("");
  const [genCategoryId, setGenCategoryId] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  /* ---- Section B: Improve ---- */
  const [improveId, setImproveId] = useState("");
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveError, setImproveError] = useState<string | null>(null);
  const [improveSuccess, setImproveSuccess] = useState<string | null>(null);

  /* ---- Section C: Edit / Patch ---- */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContent, setEditContent] = useState("<p></p>");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [editCoverUrl, setEditCoverUrl] = useState<string | null>(null);
  const [editCoverPublicId, setEditCoverPublicId] = useState<string | null>(
    null,
  );
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  const uploadImage = async (
    file: File,
  ): Promise<{ url: string; publicId: string }> => {
    const data = new FormData();
    data.append("image", file);
    const res = await fetch(`${APP_URL}/api/admin/upload/image`, {
      method: "POST",
      body: data,
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "فشل رفع الصورة");
    return {
      url: result.url || result.data?.url,
      publicId: result.publicId || result.data?.publicId,
    };
  };

  const resetEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditContent("<p></p>");
    setEditCategoryId("");
    setEditKeywords([]);
    setEditStatus("DRAFT");
    setEditCoverUrl(null);
    setEditCoverPublicId(null);
    setEditFile(null);
    setEditPreview("");
    setEditError(null);
    setEditSuccess(null);
  };

  const loadForEdit = (article: AiArticle) => {
    setEditingId(article.id);
    setEditTitle(article.title);
    setEditDescription(article.description || "");
    setEditContent(article.content || "<p></p>");
    setEditCategoryId(article.categoryId || "");
    setEditKeywords(article.keywords || []);
    setEditStatus(article.status || "DRAFT");
    setEditCoverUrl(article.coverImageUrl);
    setEditCoverPublicId(article.coverImageId);
    setEditPreview(article.coverImageUrl || "");
    setEditFile(null);
    setEditError(null);
    setEditSuccess(null);
    // Scroll edit form into view
    setTimeout(
      () =>
        document
          .getElementById("ai-edit-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  };

  /* ---------------------------------------------------------------- */
  /*  A — Generate                                                     */
  /* ---------------------------------------------------------------- */

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTitle.trim()) {
      setGenError("العنوان مطلوب");
      return;
    }
    if (!genCategoryId) {
      setGenError("التصنيف مطلوب");
      return;
    }

    setGenLoading(true);
    setGenError(null);
    setGenSuccess(null);

    try {
      const payload: { title: string; categoryId: string; description?: string } = {
        title: genTitle,
        categoryId: genCategoryId,
      };
      if (genDescription.trim()) {
        payload.description = genDescription.trim();
      }

      const res = await fetch(`${APP_URL}/api/admin/articles/ai-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || `خطأ ${res.status} من الخادم`);

      const newArticle: AiArticle = json.data || json;
      setArticles((prev) => [newArticle, ...prev]);
      setGenSuccess(
        `✓ تم توليد المقال بنجاح: "${newArticle.title}" (مسودة)`,
      );
      setGenTitle("");
      setGenDescription("");
      setGenCategoryId("");
      await fetch("/api/revalidate-metatags");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setGenError(err.message || "حدث خطأ أثناء توليد المقال");
    } finally {
      setGenLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  B — Improve                                                      */
  /* ---------------------------------------------------------------- */

  const triggerImprove = async (articleId: string) => {
    setImproveId(articleId);
    setImproveLoading(true);
    setImproveError(null);
    setImproveSuccess(null);

    try {
      const res = await fetch(
        `${APP_URL}/api/admin/articles/${articleId}/ai-improve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || `خطأ ${res.status} من الخادم`);

      const updated: AiArticle = json.data || json;
      setArticles((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      setImproveSuccess(`✓ تم تحسين محتوى المقال بنجاح`);
      await fetch("/api/revalidate-metatags");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setImproveError(err.message || "حدث خطأ أثناء تحسين المقال");
    } finally {
      setImproveLoading(false);
      setImproveId("");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Quick publish/unpublish toggle                                   */
  /* ---------------------------------------------------------------- */

  const toggleStatus = async (article: AiArticle) => {
    const newStatus: "DRAFT" | "PUBLISHED" =
      article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    try {
      const res = await fetch(`${APP_URL}/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "فشل تغيير الحالة");
      const updated: AiArticle = json.data || json;
      setArticles((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      await fetch("/api/revalidate-metatags");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  C — PATCH save                                                   */
  /* ---------------------------------------------------------------- */

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!editTitle.trim()) {
      setEditError("العنوان مطلوب");
      return;
    }

    setEditSaving(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      let finalCoverUrl = editCoverUrl;
      let finalCoverPublicId = editCoverPublicId;

      if (editFile) {
        const uploaded = await uploadImage(editFile);
        finalCoverUrl = uploaded.url;
        finalCoverPublicId = uploaded.publicId;
      }

      const body: Record<string, unknown> = {
        title: editTitle,
        description: editDescription.trim() ? editDescription.trim() : null,
        content: editContent,
        keywords: editKeywords,
        status: editStatus,
        ...(editCategoryId ? { categoryId: editCategoryId } : {}),
        ...(finalCoverUrl !== null ? { coverImageUrl: finalCoverUrl } : { coverImageUrl: null }),
        ...(finalCoverPublicId !== null
          ? { coverImageId: finalCoverPublicId }
          : { coverImageId: null }),
      };

      const res = await fetch(`${APP_URL}/api/admin/articles/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "فشل تحديث المقال");

      const updated: AiArticle = json.data || json;
      setArticles((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      setEditSuccess("تم التحديث بنجاح ✓");
      await fetch("/api/revalidate-metatags");
      resetEdit();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setEditError(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setEditSaving(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Delete                                                           */
  /* ---------------------------------------------------------------- */

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;
    try {
      const res = await fetch(`${APP_URL}/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("فشل حذف المقال");
      setArticles((prev) => prev.filter((a) => a.id !== id));
      await fetch("/api/revalidate-metatags");
      if (editingId === id) resetEdit();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء الحذف");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/*  SECTION A — AI Generate                                     */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <SectionHeader
          gradient="bg-gradient-to-br from-violet-500 to-indigo-600"
          icon={
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
          }
          title="توليد مقال بالذكاء الاصطناعي"
          subtitle="أدخل عنواناً خاماً وتصنيفاً — سيكتب الذكاء الاصطناعي مقالاً عربياً متكاملاً (≥ 600 كلمة) مُحسَّناً لمحركات البحث"
        />

        <form onSubmit={handleGenerate} className="space-y-4">
          {genError && <AlertBanner type="error" message={genError} />}
          {genSuccess && <AlertBanner type="success" message={genSuccess} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#57534E]">
                عنوان المقال (خام) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="مثال: أفضل نصائح تطوير الويب للمبتدئين"
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                disabled={genLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#57534E]">
                التصنيف <span className="text-red-500">*</span>
              </label>
              <select
                value={genCategoryId}
                onChange={(e) => setGenCategoryId(e.target.value)}
                disabled={genLoading}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white text-[#332822] focus:outline-none focus:ring-2 focus:ring-violet-400/40 disabled:opacity-60"
                dir="rtl"
              >
                <option value="">— اختر تصنيفاً —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#57534E]">
                الوصف / السياق الإضافي للمقال (اختياري)
              </label>
              <span className="text-[11px] text-[#8B7D72]">
                توجيه للذكاء الاصطناعي (الجمهور المستهدف، خدمات، مدن...)
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="مثال: ركز على مناطق تأجير الدفايات في الرياض، والمدن التي تتوفر فيها الخدمة، وأنواع الدفايات المناسبة للجلسات والمناسبات الخارجية، مع توضيح طريقة الحجز والتوصيل."
              value={genDescription}
              onChange={(e) => setGenDescription(e.target.value)}
              disabled={genLoading}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white text-[#332822] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-violet-400/40 disabled:opacity-60 resize-y"
              dir="rtl"
            />
          </div>

          <button
            type="submit"
            disabled={genLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-sm"
          >
            {genLoading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                جارٍ التوليد...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                  <circle cx="7.5" cy="14.5" r="1.5" />
                  <circle cx="16.5" cy="14.5" r="1.5" />
                </svg>
                توليد بالذكاء الاصطناعي
              </>
            )}
          </button>

          {genLoading && (
            <p className="text-xs text-violet-600 animate-pulse">
              يُعالج الذكاء الاصطناعي طلبك، قد يستغرق هذا 15–30 ثانية…
            </p>
          )}
        </form>
      </div>

      {/* ============================================================ */}
      {/*  SECTION B — AI Improve status banner                        */}
      {/* ============================================================ */}
      {(improveError || improveSuccess) && (
        <div>
          {improveError && <AlertBanner type="error" message={improveError} />}
          {improveSuccess && (
            <AlertBanner type="success" message={improveSuccess} />
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/*  SECTION C — Edit / PATCH                                    */}
      {/* ============================================================ */}
      {editingId && (
        <div
          id="ai-edit-section"
          className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm ring-2 ring-indigo-200"
        >
          <SectionHeader
            gradient="bg-gradient-to-br from-sky-500 to-blue-600"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-white"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            }
            title="تعديل المقال"
            subtitle={`تعديل محتوى المقال وبياناته — PATCH /api/admin/articles/${editingId}`}
          />

          <form onSubmit={handleEditSave} className="space-y-4">
            {editError && <AlertBanner type="error" message={editError} />}
            {editSuccess && (
              <AlertBanner type="success" message={editSuccess} />
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#57534E]">
                العنوان
              </label>
              <Input
                placeholder="عنوان المقال"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={editSaving}
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#57534E]">
                الوصف / السياق الإضافي (اختياري)
              </label>
              <textarea
                rows={2}
                placeholder="سياق المقال أو الوصف الذي وجه الذكاء الاصطناعي"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={editSaving}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white text-[#332822] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-sky-400/40 disabled:opacity-60 resize-y"
                dir="rtl"
              />
            </div>

            {/* Category + Status row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#57534E]">
                  التصنيف
                </label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  disabled={editSaving}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white text-[#332822] focus:outline-none focus:ring-2 focus:ring-sky-400/40 disabled:opacity-60"
                  dir="rtl"
                >
                  <option value="">— اختر تصنيفاً —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#57534E]">
                  الحالة
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as "DRAFT" | "PUBLISHED")
                  }
                  disabled={editSaving}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white text-[#332822] focus:outline-none focus:ring-2 focus:ring-sky-400/40 disabled:opacity-60"
                  dir="rtl"
                >
                  <option value="DRAFT">مسودة</option>
                  <option value="PUBLISHED">منشور</option>
                </select>
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#57534E]">
                الكلمات المفتاحية
              </label>
              <KeywordTagManager
                keywords={editKeywords}
                onChange={setEditKeywords}
                showFooterActions={false}
              />
            </div>

            {/* Cover image */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#57534E]">
                صورة الغلاف
              </label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-sky-400 transition-colors"
                onClick={() =>
                  document.getElementById("ai-cover-input")?.click()
                }
              >
                {editPreview || editCoverUrl ? (
                  <Image
                    src={editPreview || (editCoverUrl as string)}
                    width={600}
                    height={400}
                    alt="معاينة صورة الغلاف"
                    className="max-h-32 object-contain rounded"
                  />
                ) : (
                  <p className="text-gray-400 text-xs">
                    انقر لإضافة صورة الغلاف
                  </p>
                )}
                <input
                  id="ai-cover-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setEditFile(e.target.files[0]);
                      setEditPreview(
                        URL.createObjectURL(e.target.files[0]),
                      );
                    }
                  }}
                />
              </div>
              {editCoverUrl && (
                <button
                  type="button"
                  className="text-xs text-red-500 hover:text-red-700 mt-1"
                  onClick={() => {
                    setEditCoverUrl(null);
                    setEditCoverPublicId(null);
                    setEditPreview("");
                    setEditFile(null);
                  }}
                >
                  إزالة الصورة
                </button>
              )}
            </div>

            {/* Content editor */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#57534E]">
                المحتوى
              </label>
              <ArticleEditor content={editContent} onChange={setEditContent} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={editSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-l from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-60 transition-all shadow-sm"
              >
                {editSaving ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    جارٍ الحفظ...
                  </>
                ) : (
                  "حفظ التعديلات"
                )}
              </button>
              <button
                type="button"
                onClick={resetEdit}
                className="px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Article List                                                 */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[#1C1917]">
              كل المقالات
            </h2>
            <p className="text-xs text-[#8B7D72] mt-0.5">
              {articles.length} مقال
            </p>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-7 h-7 text-slate-300"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">لا توجد مقالات حتى الآن</p>
            <p className="text-xs text-slate-300 mt-1">
              استخدم قسم التوليد أعلاه لإنشاء أول مقال
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="group flex flex-col md:flex-row md:items-start md:justify-between gap-3 border border-slate-100 rounded-xl px-4 py-4 hover:border-slate-200 hover:shadow-sm transition-all"
              >
                {/* Left: image + info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {article.coverImageUrl && (
                    <div className="w-14 h-14 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                      <Image
                        src={article.coverImageUrl}
                        alt={article.title}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#1C1917] text-sm leading-snug">
                        {article.title}
                      </span>
                      <StatusBadge status={article.status || "DRAFT"} />
                      {article.category && (
                        <span className="text-xs bg-[#f3ede8] text-[#6B4E2F] px-2 py-0.5 rounded-full font-medium shrink-0">
                          {article.category.title}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                      /{article.slug}
                    </p>
                    {article.description && (
                      <p className="text-xs text-[#6E6259] bg-slate-50 border border-slate-100 p-2 rounded-md line-clamp-2 max-w-xl text-right dir-rtl">
                        <span className="font-semibold text-[#443831] text-[11px] block mb-0.5">
                          سياق AI:
                        </span>
                        {article.description}
                      </p>
                    )}
                    {article.keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {article.keywords.slice(0, 5).map((kw) => (
                          <span
                            key={kw}
                            className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 rounded-md"
                          >
                            {kw}
                          </span>
                        ))}
                        {article.keywords.length > 5 && (
                          <span className="text-[10px] text-slate-400">
                            +{article.keywords.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* Edit */}
                  <button
                    onClick={() => loadForEdit(article)}
                    title="تعديل"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                    تعديل
                  </button>

                  {/* AI Improve */}
                  <button
                    onClick={() => triggerImprove(article.id)}
                    disabled={improveLoading && improveId === article.id}
                    title="تحسين بالذكاء الاصطناعي"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-violet-200 text-violet-700 hover:bg-violet-50 disabled:opacity-60 transition-colors"
                  >
                    {improveLoading && improveId === article.id ? (
                      <svg
                        className="animate-spin w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                        <circle cx="7.5" cy="14.5" r="1.5" />
                        <circle cx="16.5" cy="14.5" r="1.5" />
                      </svg>
                    )}
                    تحسين AI
                  </button>

                  {/* Publish / Unpublish toggle */}
                  <button
                    onClick={() => toggleStatus(article)}
                    title={
                      article.status === "PUBLISHED" ? "تحويل لمسودة" : "نشر"
                    }
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${article.status === "PUBLISHED"
                      ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                  >
                    {article.status === "PUBLISHED" ? "إلغاء النشر" : "نشر"}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(article.id)}
                    title="حذف"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3.5 h-3.5"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
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
