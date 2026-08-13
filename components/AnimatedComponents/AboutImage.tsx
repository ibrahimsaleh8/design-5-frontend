"use client";
import { motion } from "motion/react";
import Image from "next/image";

export default function AboutImage({ imageUrl }: { imageUrl: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex justify-center items-center">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={imageUrl}
          alt="Hero Image"
          width={800}
          height={600}
          className="w-full h-200 object-top object-cover"
          priority
        />
        {/* Overlay Card */}
        <div className="absolute bottom-6 right-6 bg-white rounded-xl p-4 shadow-lg max-w-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-main-color))]/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[hsl(var(--color-main-color))]"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[hsl(var(--color-text-heading))]">
              جودة استثنائية
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
