import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardHeader from "../_components/DashboardHeader";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token");
  if (!token) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-[#F9F6F0]" dir="rtl">
      <DashboardHeader />
      <main className="max-w-6xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
