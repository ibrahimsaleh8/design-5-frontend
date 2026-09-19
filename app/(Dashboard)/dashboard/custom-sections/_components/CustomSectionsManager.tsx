"use client";

import { useState, useRef } from "react";
import { APP_URL } from "@/lib/ProjectId";
import { CustomSection } from "@/lib/types";
import ArticleEditor from "@/app/(Dashboard)/dashboard/articles/_components/ArticleEditor";
import { Toast } from "@/app/(Dashboard)/_components/Toast";
import Swal from "sweetalert2";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Layers,
  Check,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";

export default function CustomSectionsManager({
  initialSections,
  token,
}: {
  initialSections: CustomSection[];
  token: string;
}) {
  const [sections, setSections] = useState<CustomSection[]>(initialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState<string>("<p></p>");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewingIds, setPreviewingIds] = useState<Record<string, boolean>>(
    {},
  );

  const formRef = useRef<HTMLDivElement>(null);

  const isBlankContent = (html: string) => {
    const text = html.replace(/<[^>]*>/g, "").trim();
    const hasImage = /<img\s[^>]*>/i.test(html);
    const hasIframe = /<iframe\s[^>]*>/i.test(html);
    return !text && !hasImage && !hasIframe;
  };

  const handleResetForm = () => {
    setEditingId(null);
    setContent("<p></p>");
  };

  const handleEditClick = (section: CustomSection) => {
    setEditingId(section.id);
    setContent(section.content || "<p></p>");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlankContent(content)) {
      Toast({
        icon: "warning",
        message: "يرجى كتابة محتوى للقسم المخصص قبل الحفظ",
      });
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `${APP_URL}/api/admin/custom-sections/${editingId}`
        : `${APP_URL}/api/admin/custom-sections`;

      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "فشلت عملية حفظ القسم المخصص");
      }

      const savedSection: CustomSection = json.data;

      if (editingId) {
        setSections((prev) =>
          prev.map((s) => (s.id === savedSection.id ? savedSection : s)),
        );
        Toast({
          icon: "success",
          message: "تم تحديث القسم المخصص بنجاح",
        });
      } else {
        setSections((prev) => [savedSection, ...prev]);
        Toast({
          icon: "success",
          message: "تم إنشاء القسم المخصص بنجاح",
        });
      }

      handleResetForm();

      // Revalidate main page so home is updated
      try {
        await fetch("/api/revalidate-main-data");
      } catch {
        // silently continue
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ";
      Toast({
        icon: "error",
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا القسم المخصص نهائياً ولن يظهر في الصفحة الرئيسية.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6B4E2F",
      confirmButtonText: "نعم، احذف القسم",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);

    try {
      const res = await fetch(`${APP_URL}/api/admin/custom-sections/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "فشل حذف القسم المخصص");
      }

      setSections((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) {
        handleResetForm();
      }

      Toast({
        icon: "success",
        message: "تم حذف القسم المخصص بنجاح",
      });

      // Revalidate main page
      try {
        await fetch("/api/revalidate-main-data");
      } catch {
        // silently continue
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "حدث خطأ أثناء حذف القسم";
      Toast({
        icon: "error",
        message: msg,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePreview = (id: string) => {
    setPreviewingIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-10">
      {/* ── Form Card with ArticleEditor ───────────────────────────── */}
      <div
        ref={formRef}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="border-b border-gray-100 bg-linear-to-l from-[#faf8f5] to-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B4E2F]/10 text-[#6B4E2F] flex items-center justify-center">
              {editingId ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "تعديل القسم المخصص" : "إضافة قسم مخصص جديد"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                استخدم المحرر لكتابة نصوص، إضافة صور، جداول، روابط وتنسيقات HTML
                غنية
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              إلغاء التعديل
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>محتوى القسم</span>
              <span className="flex items-center gap-1 text-[#6B4E2F]">
                <Sparkles className="w-3.5 h-3.5" />
                محرر ArticleEditor المتكامل
              </span>
            </div>

            {/* ArticleEditor */}
            <ArticleEditor
              content={content}
              onChange={setContent}
              token={token}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <AlertCircle className="w-4 h-4 text-[#8B7D72]" />
              <span>
                يتم عرض الأقسام في أسفل الصفحة الرئيسية بنفس التنسيق المحدد.
              </span>
            </div>

            <div className="flex items-center gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  إلغاء
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#6B4E2F] hover:bg-[#523c24] text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ الحفظ...</span>
                  </>
                ) : (
                  <>
                    {editingId ? (
                      <Pencil className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>{editingId ? "تحديث القسم" : "إضافة القسم"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Sections List ────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                جميع الأقسام المخصصة ({sections.length})
              </h2>
              <p className="text-xs text-gray-500">
                الأقسام مرتبة حسب تاريخ الإنشاء ويتم عرضها في أسفل الصفحة
                الرئيسية
              </p>
            </div>
          </div>
        </div>

        {sections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              لا توجد أقسام مخصصة حالياً
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1.5 leading-relaxed">
              قم بإنشاء قسمك الأول باستخدام المحرر أعلاه لإضافة محتوى مخصص أو
              إعلانات أو لافتات في أسفل الصفحة الرئيسية.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sections.map((section, idx) => {
              const isPreviewOpen = previewingIds[section.id] !== false; // default open
              const isCurrentlyEditing = editingId === section.id;
              const isDeleting = deletingId === section.id;

              return (
                <div
                  key={section.id}
                  className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${
                    isCurrentlyEditing
                      ? "border-[#6B4E2F] ring-2 ring-[#6B4E2F]/10"
                      : "border-gray-200"
                  }`}>
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#252526] text-white text-xs font-bold px-3 py-1 rounded-full">
                        قسم #{idx + 1}
                      </span>

                      {/* UUID button */}
                      <button
                        type="button"
                        onClick={() => handleCopyId(section.id)}
                        className="group flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-lg hover:border-gray-300 transition-colors"
                        title="نسخ المعرّف (UUID)">
                        {copiedId === section.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                        )}
                        <span className="font-mono text-[11px]">
                          {section.id.slice(0, 8)}...
                        </span>
                      </button>

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>أضيف: {formatDate(section.createdAt)}</span>
                      </div>

                      {section.updatedAt &&
                        section.updatedAt !== section.createdAt && (
                          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>تحديث: {formatDate(section.updatedAt)}</span>
                          </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => togglePreview(section.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        {isPreviewOpen ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                            <span>إخفاء المعاينة</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                            <span>عرض المعاينة</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditClick(section)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200/60 rounded-lg hover:bg-blue-100/70 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(section.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200/60 rounded-lg hover:bg-red-100/70 transition-colors disabled:opacity-50">
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview Area */}
                  {isPreviewOpen && (
                    <div className="p-6">
                      <div className="bg-[#fcfbf9] border border-gray-100 rounded-xl p-6">
                        <div
                          className="article-content text-[#1a1a1a] leading-relaxed max-w-none"
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
