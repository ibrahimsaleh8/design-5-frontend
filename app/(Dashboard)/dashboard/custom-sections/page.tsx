import { APP_URL } from "@/lib/ProjectId";
import { CustomSection } from "@/lib/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CustomSectionsManager from "./_components/CustomSectionsManager";

export const dynamic = "force-dynamic";

export default async function CustomSectionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/login");
  }

  let initialSections: CustomSection[] = [];

  try {
    const res = await fetch(`${APP_URL}/api/custom-sections`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        initialSections = json.data;
      } else if (Array.isArray(json)) {
        initialSections = json;
      }
    }
  } catch (err) {
    console.error("Failed to fetch custom sections:", err);
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#332822]">الأقسام المخصصة</h1>
        <p className="text-sm text-[#8B7D72] mt-1">
          إنشاء وتعديل وإدارة الأقسام المخصصة المعروضة في أسفل الصفحة الرئيسية باستخدام محرر المحتوى المتقدم.
        </p>
      </div>

      {/* Main Manager */}
      <CustomSectionsManager
        initialSections={initialSections}
        token={token.value}
      />
    </div>
  );
}
