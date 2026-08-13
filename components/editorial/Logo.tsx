import { SiteSettings } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

type Props = {
  settings: SiteSettings;
  size?: "sm" | "md";
};

export default function Logo({ settings, size = "md" }: Props) {
  const isSmall = size === "sm";

  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 shrink-0 group"
      aria-label={`${settings.projectName} — الرئيسية`}>
      {settings.logo ? (
        <Image
          src={settings.logo}
          alt={settings.projectName}
          width={isSmall ? 32 : 40}
          height={isSmall ? 32 : 40}
          className="rounded-[var(--radius-sm)] object-contain"
        />
      ) : (
        <span
          className={`flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] text-white font-bold shrink-0 ${
            isSmall ? "w-8 h-8 text-sm" : "w-10 h-10 text-base"
          }`}
          aria-hidden="true">
          {settings.projectName.charAt(0)}
        </span>
      )}
      <span
        className={`font-bold text-[var(--text-heading)] group-hover:text-[var(--primary)] transition-colors ${
          isSmall ? "text-base" : "text-lg"
        }`}>
        {settings.projectName}
      </span>
    </Link>
  );
}
