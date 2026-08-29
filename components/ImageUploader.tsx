"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { APP_URL } from "@/lib/ProjectId";

type Props = {
  /** Currently selected/previewed image URL (controlled) */
  value?: string | null;
  /** Called whenever the URL changes (direct input or after upload) */
  onChange: (url: string) => void;
  /** Token for Authorization header (required for file upload) */
  token?: string;
  /** Label shown above the uploader */
  label?: string;
  /** Placeholder text inside the drop zone */
  placeholder?: string;
  /** Upload endpoint path (relative to APP_URL). Defaults to /api/admin/upload/image */
  uploadPath?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
  className?: string;
};

export type UploadedImage = {
  url: string;
  publicId: string;
};

export default function ImageUploader({
  value,
  onChange,
  token,
  label,
  placeholder = "انقر لاختيار صورة",
  uploadPath = "/api/admin/upload/image",
  disabled = false,
  className = "",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // If no token provided, use local object URL
    if (!token) {
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
      return;
    }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch(`${APP_URL}${uploadPath}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "فشل رفع الصورة");
      const url = result.url ?? result.data?.url;
      onChange(url);
    } catch {
      // silently fail – user can retry
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-[#8B7D72]">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-[#6B4E2F] hover:underline transition-all">
            {showUrlInput ? "إخفاء رابط الصورة" : "أو أدخل رابطاً مباشراً"}
          </button>
        </div>
      )}

      {showUrlInput && (
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={disabled || isUploading}
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B4E2F]/40 disabled:opacity-60"
            dir="ltr"
          />
        </div>
      )}

      <div
        className={`relative border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors bg-gray-50/50 min-h-[100px] ${
          disabled || isUploading ? "opacity-60 cursor-not-allowed" : ""
        }`}
        onClick={() => {
          if (!disabled && !isUploading) {
            fileInputRef.current?.click();
          }
        }}>
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="w-6 h-6 animate-spin text-[#6B4E2F]" />
            <span className="text-xs text-gray-500 font-medium">
              جاري رفع الصورة...
            </span>
          </div>
        ) : value ? (
          <div className="relative group w-full flex items-center justify-center">
            <Image
              src={value}
              width={600}
              height={400}
              alt="معاينة الصورة"
              className="max-h-36 object-contain rounded-md"
              unoptimized
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity shadow-md"
              title="حذف الصورة">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-3 text-center">
            <Upload className="w-5 h-5 text-gray-400 mb-1" />
            <p className="text-gray-500 text-xs font-medium">{placeholder}</p>
            <p className="text-[11px] text-gray-400">
              اضغط لاختيار صورة من جهازك
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
      </div>
    </div>
  );
}
