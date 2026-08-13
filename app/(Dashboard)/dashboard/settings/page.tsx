import { APP_URL } from "@/lib/ProjectId";
import SettingsForm from "./_components/SettingsForm";
import { SiteSettings } from "@/lib/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface SettingsResponse {
  success: boolean;
  message: string;
  data: SiteSettings;
}

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) redirect("/login");

  let initialData: SiteSettings | null = null;

  try {
    const res = await fetch(`${APP_URL}/api/settings`, { cache: "no-store" });

    if (res.ok) {
      const json: SettingsResponse = await res.json();
      if (json.success && json.data) {
        initialData = json.data;
      }
    }
  } catch (err) {
    console.error("Failed to fetch site settings:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">إعدادات الموقع</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة اسم الموقع، الشعار، معلومات محركات البحث (SEO)، والبانر الرئيسي
        </p>
      </div>

      <SettingsForm initialData={initialData} token={token.value} />
    </div>
  );
}
