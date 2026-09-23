import { APP_URL } from "@/lib/ProjectId";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiResponse, LocationData, SiteSettings } from "@/lib/types";
import SettingsTabsView from "./_components/SettingsTabsView";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) redirect("/login");

  let initialSettings: SiteSettings | null = null;
  let initialLocation: LocationData | null = null;

  // 1. Fetch site settings
  try {
    const res = await fetch(`${APP_URL}/api/settings`, { cache: "no-store" });
    if (res.ok) {
      const json: ApiResponse<SiteSettings> = await res.json();
      if (json.success && json.data) {
        initialSettings = json.data;
      }
    }
  } catch (err) {
    console.error("Failed to fetch site settings:", err);
  }

  // 2. Fetch location data as documented in location-apis.md
  try {
    const res = await fetch(`${APP_URL}/api/location`, { cache: "no-store" });
    if (res.ok) {
      const json: ApiResponse<LocationData> = await res.json();
      if (json.success && json.data) {
        initialLocation = json.data;
      }
    }
  } catch (err) {
    console.error("Failed to fetch location data:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">إعدادات الموقع</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة اسم الموقع، الشعار، معلومات محركات البحث (SEO)، والبانر الرئيسي،
          والموقع الجغرافي على الخريطة
        </p>
      </div>

      <SettingsTabsView
        initialSettings={initialSettings}
        initialLocation={initialLocation}
        token={token.value}
      />
    </div>
  );
}
