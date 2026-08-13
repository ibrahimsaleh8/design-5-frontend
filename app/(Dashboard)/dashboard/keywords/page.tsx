// app/dashboard/[id]/keywords/page.tsx
import { APP_URL, CurrentProjectId } from "@/lib/ProjectId";
import KeywordsForm from "./_components/KeywordsForm";

interface KeywordsData {
  keywords: string[];
  siteTitle: string;
  siteDescription: string;
  updatedAt: string;
}

export interface GetKeywordsResponse {
  success: boolean;
  data: KeywordsData;
}

export default async function KeywordsPage() {
  const res = await fetch(
    `${APP_URL}/api/dashboard/${CurrentProjectId}/get-keywords`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch keywords data");
  }

  const data: GetKeywordsResponse = await res.json();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إدارة الكلمات المفتاحية</h1>
        <p className="text-sm text-gray-600 mt-1">
          قم بإضافة وتعديل الكلمات المفتاحية لتحسين ظهور موقعك في محركات البحث
        </p>
      </div>

      <KeywordsForm
        projectId={CurrentProjectId}
        initialKeywords={data.data.keywords}
        siteTitle={data.data.siteTitle}
        siteDescription={data.data.siteDescription}
      />
    </div>
  );
}
