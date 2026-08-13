import { APP_URL } from "@/lib/ProjectId";
import SocialMediaForm from "./_components/SocialMediaForm";
import { SocialLinks } from "@/lib/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface SocialMediaResponse {
  success: boolean;
  data: SocialLinks;
}
export const dynamic = "force-dynamic";

export default async function SocialMediaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) redirect("/login");

  let initialData: SocialLinks | null = null;

  try {
    const res = await fetch(`${APP_URL}/api/socials`, { cache: "no-store" });

    if (res.ok) {
      const json: SocialMediaResponse = await res.json();
      if (json.success && json.data) {
        initialData = json.data;
      }
    }
  } catch (err) {
    console.error("Failed to fetch social media links:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          روابط وسائل التواصل الاجتماعي
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          أضف وعدّل روابط حسابات المشروع على منصات التواصل الاجتماعي المختلفة
        </p>
      </div>

      <SocialMediaForm initialData={initialData} token={token.value} />
    </div>
  );
}
