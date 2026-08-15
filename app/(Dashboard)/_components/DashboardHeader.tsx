"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Home,
  LayoutDashboard,
  Menu,
  Newspaper,
  Settings,
  Share2,
  X,
} from "lucide-react";
import { useState } from "react";
import { LogoutAction } from "./LogutAction";

const navItems = [
  { title: "الرئيسية", url: "/dashboard", icon: LayoutDashboard },
  { title: "المقالات", url: "/dashboard/articles", icon: Newspaper },
  { title: "مقالات AI", url: "/dashboard/ai-articles", icon: Bot },
  { title: "وسائل التواصل", url: "/dashboard/social-media", icon: Share2 },
  { title: "الإعدادات", url: "/dashboard/settings", icon: Settings },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E7E2D8] shadow-sm"
      dir="rtl">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 shrink-0 group">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D5048] to-[#0F766E] text-white shadow-sm group-hover:shadow-md transition-shadow">
            <LayoutDashboard className="w-4.5 h-4.5" />
          </span>
          <span className="font-extrabold text-[#1C1917] text-sm hidden sm:block">
            لوحة التحكم
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.url}
                href={item.url}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-[#E6F4F1] text-[#0F766E]"
                    : "text-[#57534E] hover:bg-[#F9F6F0] hover:text-[#0F766E]"
                }`}
                aria-current={isActive ? "page" : undefined}>
                <Icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#57534E] border border-[#E7E2D8] hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
            title="الصفحة الرئيسية">
            <Home className="w-4 h-4" />
            <span>الموقع</span>
          </Link>
          <button
            onClick={() => LogoutAction()}
            className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0D5C56] transition-colors"
            id="dashboard-logout-btn">
            تسجيل خروج
          </button>

          <button
            className="md:hidden p-2 rounded-xl border border-[#E7E2D8] text-[#1C1917] hover:bg-[#E6F4F1] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={menuOpen}
            id="dashboard-mobile-menu-btn">
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="md:hidden border-t border-[#E7E2D8] bg-white px-5 py-4 flex flex-col gap-1"
          dir="rtl"
          aria-label="Mobile dashboard navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.url}
                href={item.url}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-[#E6F4F1] text-[#0F766E]"
                    : "text-[#57534E] hover:bg-[#F9F6F0]"
                }`}>
                <Icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
          <div className="border-t border-[#E7E2D8] my-2" />
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-[#57534E] hover:bg-[#F9F6F0]">
            <Home className="w-4 h-4" />
            <span>الصفحة الرئيسية</span>
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              LogoutAction();
            }}
            className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#0F766E] hover:bg-[#0D5C56] mt-1">
            تسجيل خروج
          </button>
        </nav>
      )}
    </header>
  );
}
