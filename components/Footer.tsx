import Logo from "@/components/editorial/Logo";
import { SiteSettings, SocialLinks } from "@/lib/types";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

type Props = {
  settings: SiteSettings;
  socials: SocialLinks | null;
};
const mapEmbedSrc =
  "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7247.733529263881!2d46.7653!3d24.731454!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f013bec0d4b7b%3A0xeb4d9048d7b13647!2z2YLZh9mI2KzZiiDZiNi12KjYp9io2YrZhiDZgtmH2YjYqSDYp9mE2LHZitin2LY!5e0!3m2!1sar!2str!4v1728329118756!5m2!1sar!2str";

export default function Footer({ settings, socials }: Props) {
  const year = new Date().getFullYear();

  const socialItems = [
    { href: socials?.instagram, icon: FaInstagram, label: "انستغرام" },
    { href: socials?.twitter, icon: FaTwitter, label: "X" },
    { href: socials?.facebook, icon: FaFacebookF, label: "فيسبوك" },
    { href: socials?.youtube, icon: FaYoutube, label: "يوتيوب" },
  ].filter((item) => item.href);

  return (
    <footer className="mt-auto bg-[var(--bg-section)] border-t border-[var(--border-light)] p-10">
      <div className="site-container py-8 md:py-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <Logo settings={settings} size="sm" />
            <p className="text-xs text-[var(--text-muted)]">
              © {year} {settings.projectName}. جميع الحقوق محفوظة.
            </p>
          </div>
          <div>
            <h3 className="mb-4 font-medium">موقعنا على الخريطة</h3>

            <div className="w-full  md:aspect-21/9 min-h-55">
              <iframe
                src={mapEmbedSrc}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقع قهوجيين الرياض على الخريطة"
                className="w-full h-full border-0"
              />
            </div>
          </div>
          {socialItems.length > 0 && (
            <div className="space-y-4">
              <p className="font-medium">صفحاتنا فى وسائل التواصل الاجتماعى:</p>
              <div className="flex items-center gap-3">
                {socialItems.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-light)] bg-white text-[var(--text-body)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
