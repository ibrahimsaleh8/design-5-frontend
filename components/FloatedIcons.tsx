"use client";

import { SocialLinks } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Headset, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaPhone,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

type Props = {
  whatsapp: string;
  telephone: string;
  socialMedia: SocialLinks | null;
};

type ContactItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  ring: string;
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 480,
      damping: 26,
      delay: i * 0.05,
    },
  }),
  exit: { opacity: 0, y: 8, scale: 0.9, transition: { duration: 0.15 } },
};

export default function FloatedIcons({
  whatsapp,
  telephone,
  socialMedia,
}: Props) {
  const [open, setOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const whatsappNumber = whatsapp.includes("+")
    ? whatsapp.replace("+", "")
    : whatsapp;

  const items: ContactItem[] = [];

  if (whatsapp) {
    items.push({
      label: "واتساب",
      href: `https://wa.me/${whatsappNumber}?text=`,
      icon: FaWhatsapp,
      color: "#25D366",
      ring: "ring-[#25D366]/30",
    });
  }

  if (telephone) {
    items.push({
      label: "اتصال هاتفي",
      href: `tel:${telephone}`,
      icon: FaPhone,
      color: "var(--primary)",
      ring: "ring-[var(--primary)]/30",
    });
  }

  if (socialMedia?.instagram) {
    items.push({
      label: "انستغرام",
      href: socialMedia.instagram,
      icon: FaInstagram,
      color: "#C13584",
      ring: "ring-[#C13584]/30",
    });
  }

  if (socialMedia?.facebook) {
    items.push({
      label: "فيسبوك",
      href: socialMedia.facebook,
      icon: FaFacebookF,
      color: "#1877F2",
      ring: "ring-[#1877F2]/30",
    });
  }

  if (socialMedia?.twitter) {
    items.push({
      label: "تويتر",
      href: socialMedia.twitter,
      icon: FaTwitter,
      color: "#1DA1F2",
      ring: "ring-[#1DA1F2]/30",
    });
  }

  if (socialMedia?.youtube) {
    items.push({
      label: "يوتيوب",
      href: socialMedia.youtube,
      icon: FaYoutube,
      color: "#FF0000",
      ring: "ring-[#FF0000]/30",
    });
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <>
      <div
        ref={containerRef}
        className="fixed z-30 end-4 bottom-4 sm:end-6 sm:bottom-6 flex flex-col items-end gap-3"
        role="group"
        aria-label="قنوات التواصل">
        <AnimatePresence>
          {open &&
            items.map((item, index) => {
              const Icon = item.icon;
              const isExternal = !item.href.startsWith("tel:");

              return (
                <motion.div
                  key={item.label}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex items-center gap-2.5">
                  <span className="px-3 py-1.5 rounded-[var(--radius-full)] bg-white border border-[var(--border-light)] shadow-[var(--shadow-card)] text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap pointer-events-none select-none">
                    {item.label}
                  </span>
                  <a
                    href={item.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    aria-label={item.label}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg ring-2 ring-offset-2 ring-offset-[var(--bg-page)] transition-transform hover:scale-110 active:scale-95",
                      item.ring,
                    )}
                    style={{ backgroundColor: item.color }}>
                    <Icon className="w-[18px] h-[18px]" />
                  </a>
                </motion.div>
              );
            })}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "إغلاق قائمة التواصل" : "فتح قائمة التواصل"}
          aria-expanded={open}
          className={cn(
            "relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-colors duration-300",
            open
              ? "bg-[var(--text-heading)] text-white"
              : "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-[0_4px_24px_rgba(245,130,32,0.4)]",
          )}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}>
          {!open && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-[var(--primary)]/40"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                aria-hidden="true"
              />
              <motion.span
                className="absolute -top-0.5 -start-0.5 w-3 h-3 bg-white rounded-full ring-2 ring-[var(--bg-page)]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-hidden="true"
              />
            </>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}>
                <X className="w-5 h-5" aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}>
                <Headset className="w-5 h-5" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
