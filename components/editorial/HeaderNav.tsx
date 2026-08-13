"use client";

import Logo from "@/components/editorial/Logo";
import SearchForm from "@/components/editorial/SearchForm";
import { Category, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Props = {
  settings: SiteSettings;
  categories: Category[];
};

function categoryLinkClass(isActive: boolean) {
  return cn(
    "inline-flex items-center px-3 py-1.5 rounded-[var(--radius-full)] text-sm font-semibold transition-colors",
    isActive
      ? "bg-[var(--primary-light)] text-[var(--primary)]"
      : "text-[var(--text-body)] hover:bg-[var(--bg-section)] hover:text-[var(--primary)]",
  );
}

function mobileNavLinkClass(isActive: boolean) {
  return cn(
    "flex items-center px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-colors",
    isActive
      ? "bg-[var(--primary-light)] text-[var(--primary)]"
      : "text-[var(--text-body)] hover:bg-[var(--bg-section)] hover:text-[var(--primary)]",
  );
}

type NavLinksProps = {
  pathname: string;
  categories: Category[];
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

function NavLinks({
  pathname,
  categories,
  variant,
  onNavigate,
}: NavLinksProps) {
  const linkClass =
    variant === "desktop" ? categoryLinkClass : mobileNavLinkClass;

  return (
    <>
      <Link
        href="/"
        className={linkClass(pathname === "/")}
        onClick={onNavigate}>
        الرئيسية
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className={linkClass(
            pathname.startsWith(`/category/${category.slug}`),
          )}
          onClick={onNavigate}>
          {category.title}
        </Link>
      ))}
    </>
  );
}

export default function HeaderNav({ settings, categories }: Props) {
  const pathname = usePathname();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileSearch = () => {
    setMobileSearchOpen((v) => !v);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((v) => !v);
    setMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 py-3 md:py-0 z-40 bg-[var(--bg-page)] border-b border-[var(--border-light)] shadow-[var(--shadow-header)]">
      {/* Small header — mobile only */}
      <div className="md:hidden site-container">
        <div className="flex items-center justify-between gap-3 h-12">
          <Logo settings={settings} size="sm" />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMobileSearch}
              className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] text-[var(--text-body)] hover:bg-[var(--bg-section)] transition-colors"
              aria-label="بحث"
              aria-expanded={mobileSearchOpen}>
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] text-[var(--text-body)] hover:bg-[var(--bg-section)] transition-colors"
              aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="pb-3 animate-fadeIn">
            <SearchForm variant="header" className="w-full [&_input]:w-full" />
          </div>
        )}

        {mobileMenuOpen && (
          <nav
            aria-label="التنقل الرئيسي"
            className="flex flex-col gap-1 pb-3 border-t border-[var(--border-light)] pt-3 animate-fadeIn">
            <NavLinks
              pathname={pathname}
              categories={categories}
              variant="mobile"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </nav>
        )}
      </div>

      {/* Full header — desktop only */}
      <div className="hidden md:block site-container">
        <div className="flex items-center justify-between gap-4 h-[4.5rem]">
          <Logo settings={settings} />

          <SearchForm variant="header" />
        </div>

        <nav
          aria-label="التنقل الرئيسي"
          className="flex flex-wrap items-center gap-2 pb-4 border-t border-[var(--border-light)] pt-4">
          <NavLinks
            pathname={pathname}
            categories={categories}
            variant="desktop"
          />
        </nav>
      </div>
    </header>
  );
}
