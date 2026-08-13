# Implementation Plan — Arabic RTL Magazine UI Redesign (`arabic_rtl_article_website_v2.png`)

Implement the full Arabic RTL Magazine design system and component architecture matching `UI Design/arabic_rtl_article_website_v2.png` across the Next.js application with pixel-perfect visual fidelity, server component SEO optimization, clean reusable component structure, and responsive Arabic RTL layout.

## User Review Required

> [!IMPORTANT]
> - **Color Scheme & CSS Variables**: The design uses a warm ivory page background (`#F9F6F0`), dark charcoal text (`#1C1917`), rich deep teal accents (`#0F766E`), dark teal widgets (`#0D5048`), and gold accents (`#C5A059`). All existing global styles in `globals.css` will be updated to reflect this curated design system.
> - **Server Component Data Fetching**: Existing API integration endpoints (`/api/settings`, `/api/articles`, `/api/categories`, `/api/socials`) will be preserved without breaking existing contracts.
> - **Component Restructuring**: Header, Footer, Hero Section, Urgent Ticker, Sidebar Widgets (Categories, Top Rated, Newsletter), and Article Cards will be modularized for maximum maintainability.

## Open Questions

> [!NOTE]
> - **Newsletter Subscription Action**: Currently, newsletter subscription will provide client-side toast/feedback state. Is there a specific backend endpoint for newsletter subscribers or should we log/mock the request?
> - **Authentication Flow**: Header contains a "تسجيل الدخول" (Sign In) button. Should this link to `/login` or open an auth modal?

## Proposed Changes

### Global Design Tokens & Styling

#### [MODIFY] [globals.css](file:///d:/New%20Design/Design-3/frontend/app/globals.css)
- Define CSS custom variables for the color palette, typography, borders, and shadows:
  - `--bg-page`: `#F9F6F0`
  - `--bg-card`: `#FFFFFF`
  - `--bg-dark`: `#181512`
  - `--bg-ticker`: `#1F1A17`
  - `--bg-newsletter`: `#0D5048`
  - `--primary-teal`: `#0F766E`
  - `--primary-teal-dark`: `#0D5C56`
  - `--primary-teal-light`: `#147B74`
  - `--primary-teal-muted`: `#E6F4F1`
  - `--gold-accent`: `#C5A059`
  - `--text-primary`: `#1C1917`
  - `--text-heading`: `#292524`
  - `--text-body`: `#57534E`
  - `--text-muted`: `#78716C`
  - `--border-light`: `#E7E2D8`
- Configure Cairo/Amiri Google Font imports and fallback typography stacks for optimal Arabic legibility.
- Add utility classes for geometric diamond emblems (`.diamond-ornament`), category badges, hover zoom image containers, and continuous ticker marquee animation.

---

### Core Reusable Components

#### [NEW] [BrandLogo.tsx](file:///d:/New%20Design/Design-3/frontend/components/BrandLogo.tsx)
- Render geometric gold diamond emblem SVG logo + brand title ("مجلة الوَجْه" or dynamic title from site settings).

#### [NEW] [SectionTitle.tsx](file:///d:/New%20Design/Design-3/frontend/components/SectionTitle.tsx)
- Reusable section header component featuring decorative side lines and center gold diamond ornament (`─── ◆ ───`).

#### [MODIFY] [Header.tsx](file:///d:/New%20Design/Design-3/frontend/components/Header.tsx)
- Rebuild main Header to match reference design:
  - Top nav: Brand Logo on right, navigation links with bullet/diamond separators in center ("الرئيسية", "مقالات", "فنون", "علوم", "مجتمع", "رأي"), search modal toggle, theme toggle, and "تسجيل الدخول" teal outline button on left.
  - Mobile responsive drawer with sliding navigation, search bar, and social links.

#### [MODIFY] [Footer.tsx](file:///d:/New%20Design/Design-3/frontend/components/Footer.tsx)
- Rebuild Footer in dark theme (`#181512`):
  - Brand section with logo, title, and descriptive tagline.
  - Quick links column ("روابط سريعة").
  - Social media column with rounded icon buttons ("تابعنا").
  - Contact channels column ("تواصل معنا").
  - Bottom bar with copyright info and policy links.

#### [NEW] [ArticleCard.tsx](file:///d:/New%20Design/Design-3/frontend/components/ArticleCard.tsx)
- Reusable article card component supporting default grid, compact sidebar, horizontal, and featured hero layouts:
  - Aspect-ratio image container with smooth hover zoom effect.
  - Teal category tag with top accent line (e.g. فنون, علوم, ثقافة, مجتمع).
  - Title and excerpt with multi-line truncating (`line-clamp`).
  - Author avatar, author name, publication date, and estimated reading time.

#### [NEW] [HeroSection.tsx](file:///d:/New%20Design/Design-3/frontend/components/HeroSection.tsx)
- Feature section asymmetric split grid:
  - **Right column**: Main featured article with dark gradient overlay, category badge, title, subtitle, author metadata, and read button.
  - **Left column**: Two stacked secondary article cards with cover image thumbnails, category tags, titles, and dates.

#### [NEW] [UrgentTicker.tsx](file:///d:/New%20Design/Design-3/frontend/components/UrgentTicker.tsx)
- Dark news ticker bar located below hero section:
  - Teal "عاجل" badge with animated pulsating indicator.
  - Ticker headline text ("مؤتمر الثقافة العربي يفتتح فعالياته في الرياض").
  - Clock icon and relative time counter ("منذ 35 دقيقة").

#### [NEW] [Sidebar.tsx](file:///d:/New%20Design/Design-3/frontend/components/Sidebar.tsx)
- Modular sidebar containing three key widgets:
  1. **"تصنيفات"**: Category list with article counts and diamond heading ornament.
  2. **"الأعلى تقييماً"**: Top-rated/popular articles list with gold star ratings and diamond heading ornament.
  3. **"اشترك في نشرتنا"**: Newsletter subscription box with deep teal background (`#0D5048`), headline, description, email input, and submit button.

---

### Page Layouts & Routes

#### [MODIFY] [(main)/page.tsx](file:///d:/New%20Design/Design-3/frontend/app/(main)/page.tsx)
- Assemble complete homepage layout:
  - Render `HeroSection` with top articles.
  - Render `UrgentTicker` bar.
  - Render 2-column main grid (Primary Article Stream + `Sidebar`).
  - Render category-specific article showcase sections ("فنون", "علوم", "مجتمع").
  - Maintain server component data fetching (`getHomeData`) for maximum SEO performance.

#### [MODIFY] [(main)/search/page.tsx](file:///d:/New%20Design/Design-3/frontend/app/(main)/search/page.tsx)
- Redesign search results page matching design system:
  - Search query header and keyword filter pills.
  - Grid of matching article cards with pagination.
  - Integrated `Sidebar`.

#### [MODIFY] [(main)/category/[slug]/page.tsx](file:///d:/New%20Design/Design-3/frontend/app/(main)/category/[slug]/page.tsx)
- Redesign category article listing page:
  - Category header banner with article count.
  - 2-column layout with category articles grid and `Sidebar`.
  - Pagination controls.

#### [MODIFY] [(main)/[title]/page.tsx](file:///d:/New%20Design/Design-3/frontend/app/(main)/[title]/page.tsx)
- Redesign article reading page:
  - RTL Breadcrumbs ("الرئيسية / مقالات / [اسم المقال]").
  - Cover image, category badge, publication date, and author profile header.
  - Formatted article content container (`.article-content`) with high legibility line heights and styled blockquotes.
  - Social media share buttons (Twitter, Facebook, WhatsApp, Copy link).
  - Related articles grid section at bottom.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify Next.js TypeScript compilation and SSR route generation without errors.

### Visual & Functional Verification
- Use browser preview tool to verify pixel-perfect alignment against `UI Design/arabic_rtl_article_website_v2.png`.
- Test responsive layouts on Desktop (1280px+), Tablet (768px - 1024px), and Mobile (< 768px).
- Verify RTL text alignment, search filtering, category page navigation, and article reading experience.
