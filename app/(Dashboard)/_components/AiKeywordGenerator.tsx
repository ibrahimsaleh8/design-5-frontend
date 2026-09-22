"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Toast } from "@/app/(Dashboard)/_components/Toast";
import { APP_URL } from "@/lib/ProjectId";
import {
  Sparkles,
  Loader2,
  X,
  Plus,
  Copy,
  Check,
  Search,
  CheckCircle2,
} from "lucide-react";

interface AiKeywordGeneratorProps {
  existingKeywords: string[];
  onAddKeywords: (newKeywords: string[]) => void;
  disabled?: boolean;
}

export default function AiKeywordGenerator({
  existingKeywords,
  onAddKeywords,
  disabled = false,
}: AiKeywordGeneratorProps) {
  const [seedKeyword, setSeedKeyword] = useState("");
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [activeSeed, setActiveSeed] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // ─── Generate Keywords Handler ──────────────────────────────────────────────
  const handleGenerate = async () => {
    if (generating || disabled) return;

    try {
      setGenerating(true);
      setGenError(null);
      setSuggestions(null);
      setFilterQuery("");

      const payload: { keyword?: string; existingKeywords?: string[] } = {};
      const trimmed = seedKeyword.trim();
      if (trimmed) {
        payload.keyword = trimmed;
      }
      if (existingKeywords && existingKeywords.length > 0) {
        payload.existingKeywords = existingKeywords;
      }

      const response = await fetch(`${APP_URL}/api/v1/seo/keyword-generator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      const isSuccess =
        response.ok &&
        (result.status === "success" || result.success === true);

      if (!isSuccess) {
        setGenError(result.message || "فشل في توليد الكلمات المفتاحية");
        return;
      }

      const list: string[] = Array.isArray(result.data?.keywords)
        ? result.data.keywords
        : [];

      if (list.length === 0) {
        setGenError("لم يتم العثور على كلمات جديدة (قد تكون جميع الكلمات المقترحة موجودة بالفعل في الموقع).");
        return;
      }

      setSuggestions(list);
      setActiveSeed(result.data?.keyword || (trimmed || null));
      Toast({
        icon: "success",
        message: `تم توليد ${list.length} كلمة مفتاحية بنجاح`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ أثناء الاتصال بالخادم";
      setGenError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  // ─── Action Handlers ────────────────────────────────────────────────────────
  const handleAddAll = () => {
    if (!suggestions || suggestions.length === 0) return;
    const merged = Array.from(new Set([...existingKeywords, ...suggestions]));
    onAddKeywords(merged);
    setSuggestions(null);
    Toast({
      icon: "success",
      message: `تمت إضافة ${suggestions.length} كلمة مفتاحية بنجاح`,
    });
  };

  const handleAddSingle = (kw: string) => {
    if (!existingKeywords.includes(kw)) {
      onAddKeywords([...existingKeywords, kw]);
      setSuggestions((prev) => prev?.filter((item) => item !== kw) ?? null);
      Toast({ icon: "success", message: `تمت إضافة "${kw}"` });
    } else {
      Toast({ icon: "info", message: "الكلمة مضافة مسبقاً" });
    }
  };

  const handleRemoveSuggestion = (indexToRemove: number) => {
    setSuggestions((prev) => prev?.filter((_, i) => i !== indexToRemove) ?? null);
  };

  const handleCancel = () => {
    setSuggestions(null);
    setGenError(null);
    setFilterQuery("");
  };

  const handleCopyAll = async () => {
    if (!suggestions || suggestions.length === 0) return;
    try {
      await navigator.clipboard.writeText(suggestions.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Toast({
        icon: "success",
        message: "تم نسخ الكلمات المقترحة إلى الحافظة بنجاح",
      });
    } catch {
      Toast({ icon: "error", message: "تعذر النسخ إلى الحافظة" });
    }
  };

  // Filtered suggestions for client-side quick filter
  const displayedSuggestions = suggestions
    ? suggestions.filter((k) =>
        filterQuery ? k.toLowerCase().includes(filterQuery.toLowerCase()) : true
      )
    : [];

  return (
    <div className="space-y-4" dir="rtl">
      {/* AI Generator Input Box */}
      <div className="bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-purple-50/80 border border-purple-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                توليد كلمات مفتاحية بالذكاء الاصطناعي (SEO)
              </h4>
              <p className="text-[11px] text-gray-500">
                اكتب كلمة مستهدفة أو اترك الحقل فارغاً لتوليد شامل لتخصص الموقع
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-semibold text-purple-700 bg-purple-100/90 border border-purple-200 px-2.5 py-0.5 rounded-full">
            ذكاء اصطناعي مُوجّه
          </span>
        </div>

        {/* Input & Action Button Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="اكتب كلمة مفتاحية لاستهدافها (اختياري) مثل: عزل مائي، تنظيف خزانات..."
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              disabled={generating || disabled}
              className="bg-white border-purple-200 text-xs sm:text-sm pl-9 pr-3 text-right placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:border-purple-400 h-10 shadow-xs"
              dir="rtl"
            />
            {seedKeyword && (
              <button
                type="button"
                onClick={() => setSeedKeyword("")}
                disabled={generating || disabled}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors cursor-pointer"
                title="مسح الكلمة">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || disabled}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed shrink-0 cursor-pointer"
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
                <span>
                  {seedKeyword.trim()
                    ? "توليد للكلمة المستهدفة"
                    : "توليد كلمات عامة للموقع"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Context Hint */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-purple-800/80 gap-1 px-1">
          <span>
            {seedKeyword.trim() ? (
              <>
                🎯 سيتم توليد كلمات ومشتقات وأسئلة بحث دقيقة متمركزة حول{" "}
                <strong className="text-purple-900 font-bold">
                  &quot;{seedKeyword.trim()}&quot;
                </strong>{" "}
                ضمن مجال نشاط الموقع.
              </>
            ) : (
              <>
                💡 اترك الحقل فارغاً لتوليد اقتراحات جديدة تغطي نشاط ومحتوى الموقع بالكامل.
              </>
            )}
          </span>
          {seedKeyword.trim() && (
            <button
              type="button"
              onClick={() => setSeedKeyword("")}
              className="text-purple-600 hover:text-purple-900 underline underline-offset-2 shrink-0 cursor-pointer self-start sm:self-auto">
              الرجوع للتوليد العام
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {genError && !generating && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start justify-between gap-3 text-right">
          <p className="text-xs text-red-700 leading-relaxed font-medium">{genError}</p>
          <button
            type="button"
            onClick={() => setGenError(null)}
            className="text-red-400 hover:text-red-700 p-0.5 rounded transition-colors shrink-0 cursor-pointer"
            title="إغلاق">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Suggestions Panel */}
      {suggestions !== null && (
        <div className="border border-purple-200 bg-purple-50/70 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-purple-200/70">
            <div className="flex items-center flex-wrap gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-purple-900">
                الكلمات المفتاحية المقترحة
              </h4>
              {activeSeed && (
                <span className="text-[11px] bg-purple-200/80 text-purple-900 font-medium rounded-md px-2 py-0.5">
                  الكلمة المستهدفة: {activeSeed}
                </span>
              )}
              <span className="text-[11px] text-purple-700 bg-purple-100 font-semibold rounded-full px-2.5 py-0.5">
                {suggestions.length} كلمة جديدة
              </span>
            </div>

            <div className="flex items-center gap-3">
              {suggestions.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-md border border-purple-200 shadow-2xs">
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكل</span>
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                إغلاق
              </button>
            </div>
          </div>

          {/* Quick Filter (if more than 6 suggestions) */}
          {suggestions.length > 6 && (
            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 text-purple-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="تصفية الكلمات المقترحة..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="h-8 pr-8 text-xs bg-white border-purple-200 rounded-lg text-right"
                dir="rtl"
              />
            </div>
          )}

          {/* Suggestions Chips */}
          {displayedSuggestions.length === 0 ? (
            <p className="text-xs text-purple-500 text-center py-4 font-medium">
              {suggestions.length === 0
                ? "تمت إضافة أو إزالة جميع الكلمات المقترحة."
                : "لا توجد نتائج مطابقة لبحث التصفية."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
              {displayedSuggestions.map((kw, index) => (
                <span
                  key={`ai-kw-${kw}-${index}`}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-purple-950 font-medium hover:border-purple-400 hover:bg-purple-50/50 shadow-2xs transition-all">
                  <span>{kw}</span>
                  <div className="flex items-center gap-1 border-r border-purple-100 pr-1.5 mr-0.5">
                    <button
                      type="button"
                      onClick={() => handleAddSingle(kw)}
                      className="text-emerald-600 hover:text-emerald-800 p-0.5 rounded transition-colors cursor-pointer"
                      title="إضافة هذه الكلمة">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSuggestion(index)}
                      className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                      title="استبعاد">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </span>
              ))}
            </div>
          )}

          {/* Panel Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-purple-200/70">
            <button
              type="button"
              onClick={handleAddAll}
              disabled={suggestions.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background:
                  suggestions.length === 0
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              }}>
              <CheckCircle2 className="w-4 h-4" />
              <span>إضافة جميع الاقتراحات ({suggestions.length}) إلى الكلمات</span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors cursor-pointer">
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
