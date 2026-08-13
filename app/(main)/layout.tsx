import FloatedIcons from "@/components/FloatedIcons";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PreventCopy from "@/components/PreventCopy";
import { APP_URL } from "@/lib/ProjectId";
import { Category, SiteSettings, SocialLinks } from "@/lib/types";

async function getLayoutData() {
  try {
    const [settingsRes, socialsRes, categoriesRes] = await Promise.all([
      fetch(`${APP_URL}/api/settings`, { cache: "force-cache" }),
      fetch(`${APP_URL}/api/socials`, { cache: "force-cache" }),
      fetch(`${APP_URL}/api/categories`, { cache: "force-cache" }),
    ]);

    const settings: SiteSettings = settingsRes.ok
      ? (await settingsRes.json()).data
      : {
          id: 1,
          projectName: "مسار",
          logo: null,
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
          heroTitle: "",
          heroDescription: "",
          heroImage: null,
        };

    const socials: SocialLinks | null = socialsRes.ok
      ? (await socialsRes.json()).data
      : null;

    const categories: Category[] = categoriesRes.ok
      ? (await categoriesRes.json()).data
      : [];

    return { settings, socials, categories };
  } catch {
    return {
      settings: {
        id: 1,
        projectName: "مسار",
        logo: null,
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        heroTitle: "",
        heroDescription: "",
        heroImage: null,
      } as SiteSettings,
      socials: null,
      categories: [] as Category[],
    };
  }
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, socials, categories } = await getLayoutData();

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} categories={categories} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <FloatedIcons
        whatsapp={socials?.whatsapp ?? ""}
        telephone={socials?.phoneNumber ?? ""}
        socialMedia={socials}
      />
      <PreventCopy />
      <Footer settings={settings} socials={socials} />
    </div>
  );
}
