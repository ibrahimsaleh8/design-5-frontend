"use client";

import { useState } from "react";
import { APP_URL } from "@/lib/ProjectId";
import { Input } from "@/components/ui/input";
import { Category } from "@/lib/types";

export default function CategoriesManager({
  initialCategories,
  onCategoriesChange,
  token,
}: {
  initialCategories: Category[];
  onCategoriesChange: (cats: Category[]) => void;
  token: string;
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateParent = (cats: Category[]) => {
    setCategories(cats);
    onCategoriesChange(cats);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("اسم التصنيف مطلوب");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingId
        ? `${APP_URL}/api/admin/categories/${editingId}`
        : `${APP_URL}/api/admin/categories`;

      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "فشل حفظ التصنيف");

      const cat: Category = json.data || json;

      const updated = editingId
        ? categories.map((c) => (c.id === cat.id ? { ...c, ...cat } : c))
        : [cat, ...categories];

      updateParent(updated);
      setSuccess(editingId ? "تم تحديث التصنيف" : "تم إنشاء التصنيف");
      resetForm();
      await fetch("/api/revalidate-metatags");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setTitle(cat.title);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${APP_URL}/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "فشل حذف التصنيف");
      }

      const updated = categories.filter((c) => c.id !== id);
      updateParent(updated);
      setSuccess("تم حذف التصنيف بنجاح");
      await fetch("/api/revalidate-metatags");

      if (editingId === id) resetForm();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-5">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border p-5 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold text-[#332822]">
          {editingId ? "تعديل تصنيف" : "إضافة تصنيف جديد"}
        </h2>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#8B7D72]">
            اسم التصنيف
          </label>
          <Input
            placeholder="مثال: تقنية"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="text-xs text-gray-400">
            سيتم توليد الرابط (slug) تلقائياً من الاسم.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            disabled={saving}
            className="bg-[#6B4E2F] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#5a3f24] transition-colors disabled:opacity-60">
            {saving ? "جارٍ الحفظ..." : editingId ? "تحديث" : "إنشاء تصنيف"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-md text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              إلغاء
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="bg-white border p-5 rounded-xl space-y-3">
        <h2 className="text-lg font-semibold text-[#332822] mb-4">
          التصنيفات ({categories.length})
        </h2>

        {categories.length === 0 ? (
          <p className="text-sm text-slate-500">لا توجد تصنيفات حتى الآن.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 border border-slate-100 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div>
                    <p className="font-medium text-[#332822] text-sm">
                      {cat.title}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {cat.slug}
                    </p>
                  </div>
                  {cat._count !== undefined && (
                    <span className="text-xs bg-[#f3ede8] text-[#6B4E2F] px-2 py-0.5 rounded-full font-medium shrink-0">
                      {cat._count.articles} مقال
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-xs px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors">
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
