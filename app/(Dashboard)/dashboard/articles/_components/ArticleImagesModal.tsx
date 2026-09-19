"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Loader2,
  Upload,
  X,
  ImagePlus,
  Trash2,
  Link as LinkIcon,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { APP_URL } from "@/lib/ProjectId";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

import { ArticleImage } from "@/lib/types";
export type { ArticleImage };

type PendingImage = {
  key: string;
  file: File;
  previewUrl: string;
  alt: string;
  uploading: boolean;
  error: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  articleId?: string;
  token: string;
  initialImages?: ArticleImage[];
  onImagesChange?: (images: ArticleImage[]) => void;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function ArticleImagesModal({
  open,
  onClose,
  articleId,
  token,
  initialImages = [],
  onImagesChange,
}: Props) {
  const [images, setImages] = useState<ArticleImage[]>(initialImages);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Direct URL input state
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [directUrl, setDirectUrl] = useState("");
  const [directAlt, setDirectAlt] = useState("");
  const [isAddingDirectUrl, setIsAddingDirectUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setImages(initialImages);
      setPending([]);
      setGlobalError(null);
      setGlobalSuccess(null);
      setIsBatchUploading(false);
      setShowUrlInput(false);
      setDirectUrl("");
      setDirectAlt("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const notify = (imgs: ArticleImage[]) => onImagesChange?.(imgs);

  /* ---------- Add files to pending queue ---------- */

  const addFilesToPending = (files: File[]) => {
    if (!files.length) return;
    const newPending: PendingImage[] = files.map((file) => ({
      key: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      alt: "",
      uploading: false,
      error: null,
    }));
    setPending((prev) => [...prev, ...newPending]);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";
    addFilesToPending(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (droppedFiles.length > 0) {
      addFilesToPending(droppedFiles);
    }
  };

  const updatePendingAlt = (key: string, alt: string) =>
    setPending((prev) => prev.map((p) => (p.key === key ? { ...p, alt } : p)));

  const removePending = (key: string) =>
    setPending((prev) => {
      const item = prev.find((p) => p.key === key);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.key !== key);
    });

  const clearAllPending = () => {
    pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPending([]);
  };

  /* ---------- Batch / Multiple Images Upload & Add ---------- */

  const uploadItems = async (itemsToUpload: PendingImage[]) => {
    if (!itemsToUpload.length) return;

    setGlobalError(null);
    setGlobalSuccess(null);
    setIsBatchUploading(true);

    const keysToUpload = new Set(itemsToUpload.map((i) => i.key));

    // Mark items as uploading
    setPending((prev) =>
      prev.map((p) =>
        keysToUpload.has(p.key) ? { ...p, uploading: true, error: null } : p
      )
    );

    // 1. Upload files concurrently to /api/admin/upload/image
    const uploadPromises = itemsToUpload.map(async (item) => {
      try {
        const form = new FormData();
        form.append("image", item.file);
        const res = await fetch(`${APP_URL}/api/admin/upload/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "فشل رفع الصورة");
        const url = result.url ?? result.data?.url;
        if (!url) throw new Error("لم يتم الحصول على رابط الصورة");
        return { success: true as const, item, url };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "فشل رفع الصورة";
        return { success: false as const, item, error: msg };
      }
    });

    const uploadResults = await Promise.all(uploadPromises);

    const successful: { item: PendingImage; url: string }[] = [];
    const failed: { item: PendingImage; error: string }[] = [];

    uploadResults.forEach((res) => {
      if (res.success) {
        successful.push({ item: res.item, url: res.url });
      } else {
        failed.push({ item: res.item, error: res.error });
      }
    });

    // Update pending errors for failed uploads
    if (failed.length > 0) {
      const failedMap = new Map(failed.map((f) => [f.item.key, f.error]));
      setPending((prev) =>
        prev.map((p) => {
          if (failedMap.has(p.key)) {
            return { ...p, uploading: false, error: failedMap.get(p.key)! };
          }
          return p;
        })
      );
    }

    if (successful.length === 0) {
      setIsBatchUploading(false);
      setGlobalError("تعذر رفع الصور المحددة. يرجى مراجعة الأخطاء والمحاولة ثانية.");
      return;
    }

    // 2. Add uploaded images to article or local state
    if (!articleId) {
      // New article mode (pre-creation): store locally
      const newImagesToAdd: ArticleImage[] = successful.map(({ item, url }) => ({
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        imageUrl: url,
        alt: item.alt.trim(),
        articleId: "",
      }));

      setImages((prev) => {
        const next = [...prev, ...newImagesToAdd];
        notify(next);
        return next;
      });

      // Cleanup successful items from pending
      const successKeys = new Set(successful.map((s) => s.item.key));
      setPending((prev) => {
        prev.forEach((p) => {
          if (successKeys.has(p.key)) URL.revokeObjectURL(p.previewUrl);
        });
        return prev.filter((p) => !successKeys.has(p.key));
      });

      setGlobalSuccess(
        successful.length === 1
          ? "تم رفع وإضافة الصورة بنجاح"
          : `تم رفع وإضافة ${successful.length} صور بنجاح`
      );
      setTimeout(() => setGlobalSuccess(null), 3000);
      setIsBatchUploading(false);
      return;
    }

    // Existing article: add images via backend endpoint (supports multiple images array)
    try {
      const payload = {
        images: successful.map(({ item, url }) => ({
          imageUrl: url,
          alt: item.alt.trim(),
        })),
      };

      const res = await fetch(
        `${APP_URL}/api/admin/articles/${articleId}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "فشل حفظ الصور في المقال");

      const addedList: ArticleImage[] = Array.isArray(result.data)
        ? result.data
        : result.data
        ? [result.data]
        : successful.map(({ item, url }) => ({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            imageUrl: url,
            alt: item.alt.trim(),
            articleId,
          }));

      setImages((prev) => {
        const next = [...prev, ...addedList];
        notify(next);
        return next;
      });

      // Cleanup successful items
      const successKeys = new Set(successful.map((s) => s.item.key));
      setPending((prev) => {
        prev.forEach((p) => {
          if (successKeys.has(p.key)) URL.revokeObjectURL(p.previewUrl);
        });
        return prev.filter((p) => !successKeys.has(p.key));
      });

      setGlobalSuccess(
        addedList.length === 1
          ? "تم رفع وإضافة الصورة بنجاح"
          : `تم رفع وإضافة ${addedList.length} صور بنجاح`
      );
      setTimeout(() => setGlobalSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إضافة الصور للمقال";
      setGlobalError(msg);
      // Reset uploading status for successful uploads so user can retry adding
      const successKeys = new Set(successful.map((s) => s.item.key));
      setPending((prev) =>
        prev.map((p) =>
          successKeys.has(p.key)
            ? { ...p, uploading: false, error: "تم الرفع ولكن تعذر ربط الصورة بالمقال" }
            : p
        )
      );
    } finally {
      setIsBatchUploading(false);
    }
  };

  const uploadAll = () => {
    const unuploaded = pending.filter((p) => !p.uploading);
    if (unuploaded.length > 0) {
      uploadItems(unuploaded);
    }
  };

  const uploadOne = (item: PendingImage) => {
    uploadItems([item]);
  };

  /* ---------- Add direct image URL(s) ---------- */

  const handleAddDirectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = directUrl.trim();
    if (!trimmedUrl) return;

    setIsAddingDirectUrl(true);
    setGlobalError(null);

    // Support single URL or multiple URLs separated by commas or newlines
    const rawUrls = trimmedUrl
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (rawUrls.length === 0) {
      setIsAddingDirectUrl(false);
      return;
    }

    if (!articleId) {
      const newItems: ArticleImage[] = rawUrls.map((url, idx) => ({
        id: `temp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 9)}`,
        imageUrl: url,
        alt: directAlt.trim(),
        articleId: "",
      }));

      setImages((prev) => {
        const next = [...prev, ...newItems];
        notify(next);
        return next;
      });

      setDirectUrl("");
      setDirectAlt("");
      setShowUrlInput(false);
      setIsAddingDirectUrl(false);
      setGlobalSuccess(
        newItems.length === 1
          ? "تمت إضافة رابط الصورة بنجاح"
          : `تمت إضافة ${newItems.length} روابط بنجاح`
      );
      setTimeout(() => setGlobalSuccess(null), 2500);
      return;
    }

    try {
      const payload = {
        images: rawUrls.map((url) => ({
          imageUrl: url,
          alt: directAlt.trim(),
        })),
      };

      const res = await fetch(
        `${APP_URL}/api/admin/articles/${articleId}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "فشل إضافة الصور");

      const addedList: ArticleImage[] = Array.isArray(result.data)
        ? result.data
        : result.data
        ? [result.data]
        : rawUrls.map((url, idx) => ({
            id: `img-${Date.now()}-${idx}`,
            imageUrl: url,
            alt: directAlt.trim(),
            articleId,
          }));

      setImages((prev) => {
        const next = [...prev, ...addedList];
        notify(next);
        return next;
      });

      setDirectUrl("");
      setDirectAlt("");
      setShowUrlInput(false);
      setGlobalSuccess(
        addedList.length === 1
          ? "تمت إضافة الصورة بنجاح"
          : `تمت إضافة ${addedList.length} صور بنجاح`
      );
      setTimeout(() => setGlobalSuccess(null), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إضافة الصورة";
      setGlobalError(msg);
    } finally {
      setIsAddingDirectUrl(false);
    }
  };

  /* ---------- Delete saved image ---------- */

  const deleteImage = async (img: ArticleImage) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    setGlobalError(null);

    if (!articleId) {
      setImages((prev) => {
        const next = prev.filter((i) => i.id !== img.id);
        notify(next);
        return next;
      });
      setGlobalSuccess("تم حذف الصورة");
      setTimeout(() => setGlobalSuccess(null), 2500);
      return;
    }

    try {
      const res = await fetch(
        `${APP_URL}/api/admin/articles/${articleId}/images/${img.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "فشل حذف الصورة");
      }

      setImages((prev) => {
        const next = prev.filter((i) => i.id !== img.id);
        notify(next);
        return next;
      });
      setGlobalSuccess("تم حذف الصورة بنجاح");
      setTimeout(() => setGlobalSuccess(null), 2500);
    } catch (err: unknown) {
      setGlobalError(
        err instanceof Error ? err.message : "فشل حذف الصورة"
      );
    }
  };

  const deleteAllImages = async () => {
    if (images.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف جميع الصور (${images.length} صورة)؟`)) return;

    setGlobalError(null);

    if (!articleId) {
      setImages([]);
      notify([]);
      setGlobalSuccess("تم حذف جميع الصور");
      setTimeout(() => setGlobalSuccess(null), 2500);
      return;
    }

    try {
      // Delete images concurrently
      const deletePromises = images.map((img) =>
        fetch(`${APP_URL}/api/admin/articles/${articleId}/images/${img.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      await Promise.all(deletePromises);
      setImages([]);
      notify([]);
      setGlobalSuccess("تم حذف جميع الصور بنجاح");
      setTimeout(() => setGlobalSuccess(null), 2500);
    } catch (err: unknown) {
      setGlobalError(
        err instanceof Error ? err.message : "فشل حذف بعض الصور"
      );
    }
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(15,10,5,0.65)", backdropFilter: "blur(5px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBatchUploading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg,#fdfaf7 0%,#fff 100%)",
          border: "1px solid #e8ddd4",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#e8ddd4]"
          style={{
            background: "rgba(253,250,247,0.96)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#f0e8e0] text-[#6B4E2F]">
              <ImagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#332822]">
                صور المقال المتعددة
              </h2>
              <p className="text-[11px] text-[#8B7D72]">
                رفع وإضافة صور متعددة دفعة واحدة مع النص البديل
              </p>
            </div>
            {images.length > 0 && (
              <span className="text-xs bg-[#6B4E2F]/10 text-[#6B4E2F] px-2.5 py-0.5 rounded-full font-semibold">
                {images.length} مضافة
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isBatchUploading}
            className="p-1.5 rounded-full hover:bg-[#f0e8e0] transition-colors text-[#8B7D72] hover:text-[#332822] disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {globalError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{globalError}</span>
            </div>
          )}
          {globalSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>{globalSuccess}</span>
            </div>
          )}

          {/* Multiple Files Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group select-none text-center ${
              isDragging
                ? "border-[#6B4E2F] bg-[#f5ede6] scale-[1.01]"
                : "border-[#d4c4b5] hover:border-[#6B4E2F] hover:bg-[#fdf6f0]"
            } ${isBatchUploading ? "opacity-60 pointer-events-none" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-3 rounded-full bg-[#f5ede6] group-hover:bg-[#ebdccf] transition-colors">
              <Upload className="w-6 h-6 text-[#6B4E2F]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#4a3b32] group-hover:text-[#6B4E2F] transition-colors">
                اضغط لاختيار عدة صور أو اسحبها وأفلتها هنا
              </p>
              <p className="text-xs text-[#8B7D72] mt-1">
                يمكنك تحديد أكثر من صورة معاً (PNG · JPG · WEBP · GIF)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilePick}
              disabled={isBatchUploading}
            />
          </div>

          {/* Direct URL Input Toggle */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs font-medium text-[#6B4E2F] hover:text-[#523c24] flex items-center gap-1.5 transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              {showUrlInput ? "إخفاء إضافة الروابط المباشرة" : "أو أضف صوراً عبر روابط مباشرة"}
            </button>
            {pending.length > 0 && (
              <span className="text-xs text-[#8B7D72]">
                {pending.length} صورة بانتظار الرفع
              </span>
            )}
          </div>

          {showUrlInput && (
            <form
              onSubmit={handleAddDirectUrl}
              className="p-3.5 bg-[#fdf6f0] border border-[#e8ddd4] rounded-xl space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="رابط الصورة (أو عدة روابط مفصولة بسطر جديد)..."
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  dir="ltr"
                  className="flex-1 text-xs border border-[#d4c4b5] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4E2F]/30"
                  disabled={isAddingDirectUrl}
                />
                <input
                  type="text"
                  placeholder="النص البديل (alt)..."
                  value={directAlt}
                  onChange={(e) => setDirectAlt(e.target.value)}
                  dir="rtl"
                  className="sm:w-48 text-xs border border-[#d4c4b5] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4E2F]/30"
                  disabled={isAddingDirectUrl}
                />
                <button
                  type="submit"
                  disabled={isAddingDirectUrl || !directUrl.trim()}
                  className="text-xs font-medium bg-[#6B4E2F] text-white px-4 py-2 rounded-lg hover:bg-[#5a3e24] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                >
                  {isAddingDirectUrl ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  إضافة
                </button>
              </div>
            </form>
          )}

          {/* Pending Queue */}
          {pending.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between bg-[#f8f1eb] p-3 rounded-xl border border-[#e8ddd4]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#4a3b32]">
                    الصور الجاهزة للرفع ({pending.length})
                  </span>
                  <span className="text-[11px] text-[#8B7D72] hidden sm:inline">
                    (يمكنك إدخال النص البديل قبل الرفع)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearAllPending}
                    disabled={isBatchUploading}
                    className="text-xs text-[#8B7D72] hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                  >
                    إلغاء الكل
                  </button>
                  <button
                    type="button"
                    onClick={uploadAll}
                    disabled={isBatchUploading}
                    className="text-xs font-semibold bg-[#6B4E2F] text-white px-4 py-1.5 rounded-lg hover:bg-[#5a3e24] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isBatchUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري رفع {pending.length} صور...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع وإضافة الكل ({pending.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {pending.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-3 items-center p-2.5 bg-[#fdfaf7] border border-[#e8ddd4] rounded-xl hover:border-[#d4c4b5] transition-colors"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-[#e8ddd4] bg-[#f5ede6] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt="معاينة"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-[#4a3b32] truncate">
                          {item.file.name}
                        </p>
                        <span className="text-[10px] text-[#8B7D72] shrink-0">
                          {(item.file.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="النص البديل (alt) اختياري..."
                        value={item.alt}
                        onChange={(e) =>
                          updatePendingAlt(item.key, e.target.value)
                        }
                        disabled={item.uploading || isBatchUploading}
                        dir="rtl"
                        className="w-full text-xs border border-[#d4c4b5] rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#6B4E2F] disabled:opacity-60 bg-white"
                      />
                      {item.error && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {item.error}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pr-1">
                      {item.uploading ? (
                        <div className="p-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#6B4E2F]" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => uploadOne(item)}
                          disabled={isBatchUploading}
                          className="text-[11px] font-medium bg-[#f0e8e0] hover:bg-[#e4d7cc] text-[#6B4E2F] px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                          title="رفع هذه الصورة فقط"
                        >
                          رفع
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removePending(item.key)}
                        disabled={item.uploading || isBatchUploading}
                        className="text-[#b09880] hover:text-red-500 p-1.5 transition-colors disabled:opacity-40"
                        title="إزالة من القائمة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Images Grid */}
          {images.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-[#e8ddd4] pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#4a3b32] uppercase tracking-wide">
                    الصور الحالية المرفوعة للمقال ({images.length})
                  </h3>
                </div>
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={deleteAllImages}
                    disabled={isBatchUploading}
                    className="text-xs text-red-600 hover:text-red-700 hover:underline transition-colors"
                  >
                    حذف جميع الصور
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-xl overflow-hidden border border-[#e8ddd4] bg-[#f5ede6] aspect-square shadow-sm"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.alt || "صورة المقال"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => deleteImage(img)}
                        disabled={isBatchUploading}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg disabled:opacity-50"
                        title="حذف هذه الصورة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {img.alt && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 backdrop-blur-xs">
                        <p className="text-[10px] text-white truncate text-right">
                          {img.alt}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length === 0 && pending.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#f5ede6] text-[#b09880] flex items-center justify-center mx-auto mb-2">
                <ImagePlus className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[#8B7D72]">
                لا توجد صور مضافة للمقال بعد
              </p>
              <p className="text-xs text-[#b09880] mt-0.5">
                يمكنك رفع صور متعددة دفعة واحدة باستخدام منطقة الإفلات أعلاه
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 px-6 py-3.5 border-t border-[#e8ddd4] flex items-center justify-between"
          style={{
            background: "rgba(253,250,247,0.96)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="text-xs text-[#8B7D72]">
            {images.length > 0 && `${images.length} صور في المقال`}
          </div>

          <div className="flex items-center gap-2">
            {pending.length > 0 && (
              <button
                type="button"
                onClick={uploadAll}
                disabled={isBatchUploading}
                className="text-xs font-semibold bg-[#6B4E2F] text-white px-4 py-2 rounded-lg hover:bg-[#5a3e24] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isBatchUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                رفع الكل ({pending.length})
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isBatchUploading}
              className="text-xs font-medium px-5 py-2 rounded-lg border border-[#d4c4b5] text-[#6B4E2F] hover:bg-[#f0e8e0] transition-colors disabled:opacity-50"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
