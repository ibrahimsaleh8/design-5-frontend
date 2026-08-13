"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KeywordTagManagerProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  onSave?: () => void;
  onReset?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
  showFooterActions?: boolean;
}

export default function KeywordTagManager({
  keywords,
  onChange,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
  showFooterActions = true,
}: KeywordTagManagerProps) {
  const [inputVal, setInputVal] = useState("");

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    if (!keywords.includes(trimmed)) {
      onChange([...keywords, trimmed]);
    }
    setInputVal("");
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(keywords.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveAll = () => {
    if (keywords.length === 0) return;
    if (confirm("هل أنت متأكد من حذف جميع الكلمات المفتاحية؟")) {
      onChange([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Box 1: Add New Keyword */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm md:text-base font-bold text-gray-800">
          إضافة كلمة مفتاحية جديدة
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="... أُدخل الكلمة المفتاحية"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-white border border-gray-200 rounded-md px-4 py-2 text-sm text-right placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400 h-10"
            dir="rtl"
          />
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!inputVal.trim()}
            className="bg-[#78808a] hover:bg-[#68707a] disabled:bg-gray-300 text-white font-medium text-sm px-6 h-10 rounded-md transition-colors shrink-0"
          >
            إضافة
          </Button>
        </div>
      </div>

      {/* Box 2: Current Keywords List */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm md:text-base font-bold text-gray-800">
            الكلمات المفتاحية الحالية ({keywords.length})
          </h3>
          {keywords.length > 0 && (
            <button
              type="button"
              onClick={handleRemoveAll}
              className="text-xs md:text-sm font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
            >
              حذف الكل
            </button>
          )}
        </div>

        {keywords.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs md:text-sm">
            لا توجد كلمات مفتاحية مضافة حتى الآن.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {keywords.map((kw, index) => (
              <span
                key={`${kw}-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#efeff1] border border-[#e2e2e6] rounded-md text-xs md:text-sm text-gray-800 font-medium hover:bg-[#e4e4e8] transition-colors"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:text-red-700 font-bold text-xs px-0.5 leading-none transition-colors cursor-pointer"
                  title="حذف"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      {showFooterActions && (
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            className="bg-[#78808a] hover:bg-[#68707a] disabled:bg-gray-300 text-white font-medium text-sm px-8 h-10 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={isSaving || !hasChanges}
              className="text-xs md:text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors font-medium cursor-pointer"
            >
              إعادة تعيين
            </button>
          )}
        </div>
      )}
    </div>
  );
}
