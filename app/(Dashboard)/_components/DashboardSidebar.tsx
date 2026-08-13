"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Share2, Settings } from "lucide-react"; // Import icons

// Menu items with icons
const items = [
  { title: "الرئيسية", url: "/dashboard", icon: Home },
  { title: "المقالات", url: "/dashboard/articles", icon: Newspaper },
  { title: "وسائل التواصل", url: "/dashboard/social-media", icon: Share2 },
  { title: "الإعدادات", url: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="bg-main-color! text-white!">
      <SidebarContent className="py-10 bg-main-color! text-white!">
        <div className="px-5 text-xl font-bold">لوحة التحكم</div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white">روابط</SidebarGroupLabel>
          <SidebarGroupContent>
            <ul className="flex flex-col gap-4 w-full">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <li className="w-full flex items-center" key={item.title}>
                    <Link
                      href={item.url}
                      className={`${pathname === item.url ? "bg-white text-black" : ""} 
                        w-full text-right px-5 py-4 rounded-sm font-medium flex items-center gap-3 hover:bg-white hover:text-black duration-300`}>
                      <Icon className="w-5 h-5 text-current" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
