"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toast } from "@/app/(Dashboard)/_components/Toast";
import { APP_URL } from "@/lib/ProjectId";
import { SocialLinks } from "@/lib/types";
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Phone,
  MessageSquare,
  Save,
  Link2,
} from "lucide-react";

interface SocialMediaFormProps {
  initialData: SocialLinks | null;
  token: string;
}

const platforms = [
  {
    key: "facebook" as keyof SocialLinks,
    label: "Facebook",
    labelAr: "فيسبوك",
    placeholder: "https://facebook.com/page",
    icon: Facebook,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    key: "twitter" as keyof SocialLinks,
    label: "Twitter / X",
    labelAr: "تويتر / X",
    placeholder: "https://twitter.com/username",
    icon: Twitter,
    color: "text-sky-500",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
  },
  {
    key: "instagram" as keyof SocialLinks,
    label: "Instagram",
    labelAr: "انستقرام",
    placeholder: "https://instagram.com/username",
    icon: Instagram,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  {
    key: "youtube" as keyof SocialLinks,
    label: "YouTube",
    labelAr: "يوتيوب",
    placeholder: "https://youtube.com/@channel",
    icon: Youtube,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    key: "whatsapp" as keyof SocialLinks,
    label: "WhatsApp",
    labelAr: "واتساب",
    placeholder: "+1234567890",
    icon: MessageSquare,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    key: "phoneNumber" as keyof SocialLinks,
    label: "Phone Number",
    labelAr: "رقم الهاتف",
    placeholder: "+1234567890",
    icon: Phone,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
];

export default function SocialMediaForm({
  initialData,
  token,
}: SocialMediaFormProps) {
  const [links, setLinks] = useState<SocialLinks>(
    initialData ?? {
      id: 1,
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
      whatsapp: "",
      phoneNumber: "",
    },
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof SocialLinks,
  ) => {
    setLinks((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      facebook: links.facebook?.trim() || null,
      twitter: links.twitter?.trim() || null,
      instagram: links.instagram?.trim() || null,
      youtube: links.youtube?.trim() || null,
      whatsapp: links.whatsapp?.trim() || null,
      phoneNumber: links.phoneNumber?.trim() || null,
    };

    try {
      const res = await fetch(`${APP_URL}/api/admin/socials`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.data) {
          setLinks(data.data);
        }
        await fetch("/api/revalidate-metatags");
        Toast({
          icon: "success",
          message: "تم تحديث روابط وسائل التواصل الاجتماعي بنجاح",
        });
      } else {
        Toast({
          icon: "error",
          message: data.message || "حدث خطأ أثناء الحفظ",
        });
      }
    } catch (err) {
      console.error(err);
      Toast({ icon: "error", message: "حدث خطأ في الاتصال بالخادم" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 text-sm">
        <Link2 className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          أدخل روابط حسابات وسائل التواصل الاجتماعي ورقم الهاتف. يمكنك ترك أي
          حقل فارغاً إذا لم يكن المورد متاحاً. ستظهر الروابط على موقعك
          الإلكتروني تلقائياً.
        </p>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {platforms.map(
          ({
            key,
            label,
            labelAr,
            placeholder,
            icon: Icon,
            color,
            bgColor,
            borderColor,
          }) => {
            const rawVal = links[key];
            const value = typeof rawVal === "string" ? rawVal : "";
            return (
              <div
                key={key}
                className={`rounded-xl border ${borderColor} bg-white shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow`}>
                {/* Card header */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${bgColor}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{labelAr}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                  {/* Status indicator */}
                  <div className="mr-auto">
                    {value ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        مفعّل
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                        غير مفعّل
                      </span>
                    )}
                  </div>
                </div>

                {/* Input */}
                <div>
                  <label
                    htmlFor={key}
                    className="block mb-1.5 text-sm font-medium text-gray-600">
                    الرابط / البيانات
                  </label>
                  <Input
                    id={key}
                    name={key}
                    type="text"
                    dir="ltr"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => handleChange(e, key)}
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>

                {/* Preview link */}
                {value && value.startsWith("http") && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs ${color} hover:underline`}>
                    <Link2 className="w-3 h-3" />
                    معاينة الرابط
                  </a>
                )}
              </div>
            );
          },
        )}
      </div>

      {/* Save button */}
      <div className="flex justify-start pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-8 bg-green-700 text-white">
          <Save className="w-4 h-4" />
          {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </form>
  );
}
