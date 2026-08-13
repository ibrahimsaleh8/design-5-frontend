"use client";
import { motion } from "motion/react";

import Link from "next/link";

export default function HeroLinks({
  whatsApp,
}: {
  whatsApp?: string | undefined;
}) {
  return (
    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
      {whatsApp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          viewport={{ once: true }}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://wa.me/${whatsApp.replace(/\+/g, "")}?text=`}
            className="inline-flex items-center gap-2 bg-main-color hover:bg-main-color/90 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl">
            اطلب الخدمة الآن
          </a>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeInOut" }}
        viewport={{ once: true }}>
        <Link
          href="#gallery"
          className="inline-flex items-center gap-2 bg-white border hover:bg-white/80 text-black px-8 py-4 rounded-xl font-semibold text-lg transition-all">
          عرض معرض الأعمال
        </Link>
      </motion.div>
    </div>
  );
}
