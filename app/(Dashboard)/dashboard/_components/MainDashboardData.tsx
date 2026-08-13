"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Toast } from "../../_components/Toast";
import { APP_URL } from "@/lib/ProjectId";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface HeroSectionData {
  headline: string;
  subheadline: string;
}

interface SiteSettings {
  brandName: string;
  siteTitle: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
}

interface MainDashboardDataProps {
  project: Project;
  siteSettings: SiteSettings;
  heroSectionData: HeroSectionData;
  showContactSection: boolean;
  token: string;
}

export default function MainDashboardData({
  project,
  siteSettings,
  heroSectionData,
  showContactSection,
  token,
}: MainDashboardDataProps) {
  const [formData, setFormData] = useState({
    // Project
    projectName: project.name,
    projectDescription: project.description,

    // Site Settings
    brandName: siteSettings.brandName,
    siteTitle: siteSettings.siteTitle,
    email: siteSettings.email,
    phone: siteSettings.phone,
    whatsapp: siteSettings.whatsapp,
    address: siteSettings.address,

    heroHeadline: heroSectionData.headline,
    heroSubheadline: heroSectionData.subheadline,
  });

  const [contactVisible, setContactVisible] = useState(showContactSection);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRouter();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        `${APP_URL}/api/dashboard/${project.id}/update-project-main-data`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (res.ok) {
        Toast({ icon: "success", message: "تم حفظ البيانات بنجاح" });
      } else {
        const errorData = await res.json().catch(() => null);
        console.error("Error response:", errorData);
        Toast({ icon: "error", message: "حدث خطأ أثناء الحفظ" });
      }
      console.log("fetch", contactVisible !== showContactSection);

      // Only call the toggle endpoint if the value changed from the original
      if (contactVisible !== showContactSection) {
        await fetch(
          `${APP_URL}/api/dashboard/${project.id}/contact-section/toggle-appear`,

          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ appear: contactVisible }),
          },
        );
      }

      await fetch("/api/revalidate-metatags");
    } catch (error) {
      console.error("Error saving data:", error);
      Toast({ icon: "error", message: "حدث خطأ أثناء الحفظ" });
    } finally {
      setIsLoading(false);
      route.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {/* Project Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">بيانات المشروع</h2>

        <div>
          <label htmlFor="projectName" className="block mb-2 font-medium">
            اسم المشروع
          </label>
          <Input
            id="projectName"
            name="projectName"
            type="text"
            placeholder="اسم المشروع"
            value={formData.projectName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label
            htmlFor="projectDescription"
            className="block mb-2 font-medium">
            وصف المشروع
          </label>
          <Textarea
            id="projectDescription"
            name="projectDescription"
            placeholder="وصف المشروع"
            value={formData.projectDescription}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">القسم الرئيسى</h2>

        <div>
          <label htmlFor="heroHeadline" className="block mb-2 font-medium">
            العنوان الرئيسي
          </label>
          <Input
            id="heroHeadline"
            name="heroHeadline"
            type="text"
            placeholder="العنوان الرئيسي في الهيرو"
            value={formData.heroHeadline}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="heroSubheadline" className="block mb-2 font-medium">
            العنوان الفرعي
          </label>
          <Textarea
            id="heroSubheadline"
            name="heroSubheadline"
            placeholder="الوصف أو العنوان الفرعي"
            value={formData.heroSubheadline}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>
      </div>

      {/* Site Settings Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">إعدادات الموقع</h2>

        <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
          <div>
            <label htmlFor="brandName" className="block mb-2 font-medium">
              اسم العلامة التجارية
            </label>
            <Input
              id="brandName"
              name="brandName"
              type="text"
              placeholder="اسم العلامة التجارية"
              value={formData.brandName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="siteTitle" className="block mb-2 font-medium">
              عنوان الموقع
            </label>
            <Input
              id="siteTitle"
              name="siteTitle"
              type="text"
              placeholder="عنوان الموقع"
              value={formData.siteTitle}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 font-medium">
              البريد الإلكتروني
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block mb-2 font-medium">
                رقم الهاتف
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block mb-2 font-medium">
                واتساب
              </label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="رقم واتساب"
                value={formData.whatsapp}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block mb-2 font-medium">
              العنوان
            </label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="العنوان"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Contact Section Visibility Toggle */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">قسم التواصل</h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            id="contact-section-toggle"
            role="switch"
            aria-checked={contactVisible}
            onClick={() => setContactVisible((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              contactVisible ? "bg-blue-800" : "bg-muted-foreground/30"
            }`}>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                contactVisible ? "-translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <label
            htmlFor="contact-section-toggle"
            className="text-sm font-medium cursor-pointer select-none">
            {contactVisible ? "قسم التواصل مُفعَّل" : "قسم التواصل مخفي"}
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-40 cursor-pointer">
        {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  );
}
