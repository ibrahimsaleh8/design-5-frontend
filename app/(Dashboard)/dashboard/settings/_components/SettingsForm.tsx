"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toast } from "@/app/(Dashboard)/_components/Toast";
import { APP_URL } from "@/lib/ProjectId";
import { SiteSettings } from "@/lib/types";
import KeywordTagManager from "@/app/(Dashboard)/_components/KeywordTagManager";
import {
  Globe,
  Image as ImageIcon,
  Save,
  Search,
  Layout,
  Upload,
  Info,
  Plus,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";

interface SettingsFormProps {
  initialData: SiteSettings | null;
  token: string;
}

export default function SettingsForm({
  initialData,
  token,
}: SettingsFormProps) {
  const [formData, setFormData] = useState({
    projectName: initialData?.projectName || "",
    logo: initialData?.logo || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    metaKeywords: initialData?.metaKeywords || "",
    heroTitle: initialData?.heroTitle || "",
    heroDescription: initialData?.heroDescription || "",
    heroImage: initialData?.heroImage || "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(
    initialData?.logo || "",
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>(
    initialData?.heroImage || "",
  );
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setLogoFile(selectedFile);
      setLogoPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleHeroImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setHeroImageFile(selectedFile);
      setHeroImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const uploadLogoImage = async (file: File): Promise<string> => {
    setIsUploadingLogo(true);
    try {
      const data = new FormData();
      data.append("image", file);

      const res = await fetch(`${APP_URL}/api/admin/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "فشل رفع صورة الشعار");
      return json.data?.url || json.url;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const uploadHeroImage = async (file: File): Promise<string> => {
    setIsUploadingHeroImage(true);
    try {
      const data = new FormData();
      data.append("image", file);

      const res = await fetch(`${APP_URL}/api/admin/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "فشل رفع صورة البانر الرئيسي");
      return json.data?.url || json.url;
    } finally {
      setIsUploadingHeroImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let logoUrl = formData.logo;
      let heroImageUrl = formData.heroImage;

      if (logoFile) {
        logoUrl = await uploadLogoImage(logoFile);
      }

      if (heroImageFile) {
        heroImageUrl = await uploadHeroImage(heroImageFile);
      }

      const payload = {
        projectName: formData.projectName.trim() || undefined,
        logo: logoUrl.trim() || null,
        metaTitle: formData.metaTitle.trim() || undefined,
        metaDescription: formData.metaDescription.trim() || undefined,
        metaKeywords: formData.metaKeywords.trim() || undefined,
        heroTitle: formData.heroTitle.trim() || undefined,
        heroDescription: formData.heroDescription.trim() || undefined,
        heroImage: heroImageUrl.trim() || null,
      };

      const res = await fetch(`${APP_URL}/api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        if (json.data) {
          setFormData({
            projectName: json.data.projectName || "",
            logo: json.data.logo || "",
            metaTitle: json.data.metaTitle || "",
            metaDescription: json.data.metaDescription || "",
            metaKeywords: json.data.metaKeywords || "",
            heroTitle: json.data.heroTitle || "",
            heroDescription: json.data.heroDescription || "",
            heroImage: json.data.heroImage || "",
          });
          setLogoPreview(json.data.logo || "");
          setLogoFile(null);
          setHeroImagePreview(json.data.heroImage || "");
          setHeroImageFile(null);
        }
        await fetch("/api/revalidate-metatags");

        Toast({
          icon: "success",
          message: "تم تحديث إعدادات الموقع بنجاح",
        });
      } else {
        Toast({
          icon: "error",
          message: json.message || "حدث خطأ أثناء حفظ الإعدادات",
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ في الاتصال بالخادم";
      console.error("Settings update error:", err);
      Toast({
        icon: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  // ─── AI Suggestions State ───────────────────────────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const keywordsList = formData.metaKeywords
    ? formData.metaKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const handleKeywordsChange = (newList: string[]) => {
    setFormData((prev) => ({
      ...prev,
      metaKeywords: newList.join(", "),
    }));
  };

  // ─── AI Keyword Generator Handlers ──────────────────────────────────────────
  const handleGenerateKeywords = async () => {
    try {
      setGenerating(true);
      setGenError(null);
      setSuggestions(null);

      const response = await fetch(`${APP_URL}/api/v1/seo/keyword-generator`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setGenError(result.message || "فشل في توليد الكلمات المفتاحية");
        return;
      }

      setSuggestions(result.data.keywords as string[]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ أثناء التوليد";
      setGenError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleRemoveSuggestion = (index: number) => {
    setSuggestions((prev) => prev?.filter((_, i) => i !== index) ?? null);
  };

  const handleCancelSuggestions = () => {
    setSuggestions(null);
    setGenError(null);
  };

  const handleAddSuggestions = () => {
    if (!suggestions || suggestions.length === 0) return;
    const merged = Array.from(new Set([...keywordsList, ...suggestions]));
    handleKeywordsChange(merged);
    setSuggestions(null);
    Toast({ icon: "success", message: "تم إضافة الكلمات المقترحة بنجاح" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
      {/* Banner Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 text-sm">
        <Info className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600" />
        <p>
          قم بضبط وتحديث إعدادات الموقع الرئيسية، معلومات محركات البحث (SEO)،
          والنصوص المعروضة في القسم الرئيسي للصفحة الأولى.
        </p>
      </div>

      {/* Section 1: General Settings */}
      <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              الإعدادات العامة
            </h2>
            <p className="text-xs text-gray-500">اسم الموقع والشعار الرئيسي</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Name */}
          <div className="space-y-2">
            <label
              htmlFor="projectName"
              className="block text-sm font-semibold text-gray-700">
              اسم المشروع / الموقع
            </label>
            <Input
              id="projectName"
              name="projectName"
              placeholder="مثال: موقع الأخبار الرئيسي"
              value={formData.projectName}
              onChange={handleChange}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Logo Upload & URL */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              شعار الموقع (Logo)
            </label>
            <div className="flex items-center gap-4">
              <div
                className="relative w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 overflow-hidden bg-gray-50 shrink-0 group transition-colors"
                onClick={() =>
                  document.getElementById("logoFileInput")?.click()
                }>
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo Preview"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-emerald-600">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[10px]">اختر صورة</span>
                  </div>
                )}
                <input
                  id="logoFileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileChange}
                  disabled={isLoading}
                />
              </div>

              <div className="flex-1 space-y-2">
                <Input
                  id="logo"
                  name="logo"
                  type="url"
                  dir="ltr"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo}
                  onChange={(e) => {
                    handleChange(e);
                    setLogoPreview(e.target.value);
                  }}
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("logoFileInput")?.click()
                  }
                  disabled={isLoading || isUploadingLogo}
                  className="w-full flex items-center justify-center gap-2 text-xs text-black">
                  <Upload className="w-3.5 h-3.5" />
                  {isUploadingLogo ? "جاري الرفع..." : "رفع صورة الشعار"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: SEO Settings */}
      <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              إعدادات SEO ومحركات البحث
            </h2>
            <p className="text-xs text-gray-500">
              العناوين والكلمات المفتاحية لملاءمة محركات البحث
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Meta Title */}
          <div className="space-y-2">
            <label
              htmlFor="metaTitle"
              className="block text-sm font-semibold text-gray-700">
              عنوان SEO الرئيسي (Meta Title)
            </label>
            <Input
              id="metaTitle"
              name="metaTitle"
              placeholder="عنوان الموقع لظهوره في نتائج البحث"
              value={formData.metaTitle}
              onChange={handleChange}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <label
              htmlFor="metaDescription"
              className="block text-sm font-semibold text-gray-700">
              وصف الموقع (Meta Description)
            </label>
            <Textarea
              id="metaDescription"
              name="metaDescription"
              placeholder="وصف مختصر لمحتوى ونشاط الموقع..."
              value={formData.metaDescription}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {/* AI Keyword Generator Button */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                الكلمات المفتاحية (Meta Keywords)
              </label>

              <button
                type="button"
                onClick={handleGenerateKeywords}
                disabled={generating || isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: generating
                    ? "#a0a8b4"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}>
                {generating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    توليد كلمات مفتاحية بالذكاء الاصطناعي
                  </>
                )}
              </button>
            </div>

            {/* Generation Error */}
            {genError && !generating && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start justify-between gap-3">
                <p className="text-xs text-red-600">{genError}</p>
                <button
                  type="button"
                  onClick={() => setGenError(null)}
                  className="text-red-400 hover:text-red-600 text-xs font-bold shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* AI Suggestions Panel */}
            {suggestions !== null && (
              <div className="border border-purple-200 bg-purple-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-bold text-purple-800">
                      الكلمات المفتاحية المقترحة
                    </h4>
                    <span className="text-[11px] text-purple-600 bg-purple-100 rounded-full px-2 py-0.5">
                      {suggestions.length} كلمة
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelSuggestions}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    إلغاء العملية
                  </button>
                </div>

                {suggestions.length === 0 ? (
                  <p className="text-xs text-purple-400 text-center py-3">
                    تمت إزالة جميع الاقتراحات
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((kw, index) => (
                      <span
                        key={`setting-suggestion-${index}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-purple-200 rounded-md text-xs text-purple-800 font-medium hover:bg-purple-50 transition-colors">
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSuggestion(index)}
                          className="text-purple-400 hover:text-red-500 font-bold text-xs px-0.5 leading-none transition-colors cursor-pointer"
                          title="حذف الاقتراح">
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAddSuggestions}
                    disabled={suggestions.length === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        suggestions.length === 0
                          ? "#a0a8b4"
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}>
                    <Plus className="w-3.5 h-3.5" />
                    إضافة إلى الكلمات المفتاحية
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSuggestions}
                    className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors cursor-pointer">
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Meta Keywords - Using exact visual tag component */}
            <KeywordTagManager
              keywords={keywordsList}
              onChange={handleKeywordsChange}
              showFooterActions={false}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Hero Section */}
      <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              قسم البانر الرئيسي (Hero Section)
            </h2>
            <p className="text-xs text-gray-500">
              النصوص والصورة المعروضة في واجهة الصفحة الرئيسية
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Hero Title */}
          <div className="space-y-2">
            <label
              htmlFor="heroTitle"
              className="block text-sm font-semibold text-gray-700">
              العنوان الرئيسي للبانر (Hero Title)
            </label>
            <Input
              id="heroTitle"
              name="heroTitle"
              placeholder="أهلاً بك في منصتنا الإخبارية"
              value={formData.heroTitle}
              onChange={handleChange}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Hero Description */}
          <div className="space-y-2">
            <label
              htmlFor="heroDescription"
              className="block text-sm font-semibold text-gray-700">
              الوصف الفرعي للبانر (Hero Description)
            </label>
            <Textarea
              id="heroDescription"
              name="heroDescription"
              placeholder="اكتشف أحدث المقالات والتحليلات الحصرية يومياً..."
              value={formData.heroDescription}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {/* Hero Image Upload & URL */}
          <div className="space-y-2 pt-2">
            <label className="block text-sm font-semibold text-gray-700">
              صورة البانر الرئيسي (Hero Image)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className="relative w-full sm:w-40 h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-amber-500 overflow-hidden bg-gray-50 shrink-0 group transition-colors"
                onClick={() =>
                  document.getElementById("heroImageFileInput")?.click()
                }>
                {heroImagePreview ? (
                  <Image
                    src={heroImagePreview}
                    alt="Hero Image Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-amber-600">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[10px]">اختر صورة البانر</span>
                  </div>
                )}
                <input
                  id="heroImageFileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeroImageFileChange}
                  disabled={isLoading}
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <Input
                  id="heroImage"
                  name="heroImage"
                  type="url"
                  dir="ltr"
                  placeholder="https://example.com/hero-banner.jpg"
                  value={formData.heroImage}
                  onChange={(e) => {
                    handleChange(e);
                    setHeroImagePreview(e.target.value);
                  }}
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("heroImageFileInput")?.click()
                  }
                  disabled={isLoading || isUploadingHeroImage}
                  className="w-full flex items-center justify-center gap-2 text-xs text-black">
                  <Upload className="w-3.5 h-3.5" />
                  {isUploadingHeroImage
                    ? "جاري الرفع..."
                    : "رفع صورة البانر الرئيسي"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-start pt-2">
        <Button
          type="submit"
          disabled={isLoading || isUploadingLogo || isUploadingHeroImage}
          className="flex items-center gap-2 px-8 py-6 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all hover:shadow-lg cursor-pointer">
          <Save className="w-5 h-5" />
          {isLoading ? "جاري حفظ التغييرات..." : "حفظ الإعدادات"}
        </Button>
      </div>
    </form>
  );
}
