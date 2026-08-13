"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/app/(Dashboard)/_components/Toast";
import { APP_URL } from "@/lib/ProjectId";
import KeywordTagManager from "@/app/(Dashboard)/_components/KeywordTagManager";

interface KeywordsFormProps {
  projectId: string;
  initialKeywords: string[];
  siteTitle: string;
  siteDescription: string;
}

export default function KeywordsForm({
  projectId,
  initialKeywords,
  siteTitle,
  siteDescription,
}: KeywordsFormProps) {
  const router = useRouter();
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(
        `${APP_URL}/api/dashboard/${projectId}/update-keywrords`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keywords }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        Toast({
          icon: "error",
          message: result.message || "فشل في حفظ الكلمات المفتاحية",
        });
        return;
      }

      await fetch("/api/revalidate-metatags");
      router.refresh();
      Toast({ icon: "success", message: "تم حفظ الكلمات المفتاحية بنجاح" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ";
      setError(errorMessage);
      Toast({
        icon: "error",
        message: `خطأ: ${errorMessage}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("هل أنت متأكد من إعادة تعيين الكلمات المفتاحية؟")) {
      setKeywords(initialKeywords);
      setError(null);
    }
  };

  const hasChanges =
    JSON.stringify(keywords) !== JSON.stringify(initialKeywords);

  return (
    <div className="space-y-6" dir="rtl">
      {/* SEO Context Card */}
      <div className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-2">
          معلومات SEO الحالية
        </h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div>
            <span className="font-semibold text-gray-700">عنوان الموقع: </span>
            <span>{siteTitle}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">وصف الموقع: </span>
            <span>{siteDescription}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Keyword Tag Manager matching visual design screenshot */}
      <KeywordTagManager
        keywords={keywords}
        onChange={setKeywords}
        onSave={handleSave}
        onReset={handleReset}
        isSaving={saving}
        hasChanges={hasChanges}
        showFooterActions={true}
      />
    </div>
  );
}
