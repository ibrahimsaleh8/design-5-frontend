"use client";
import { motion } from "motion/react";
import Image from "next/image";
import WhyusImage from "@/public/images/why-us.png";

export default function WhyUsImage() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      viewport={{ once: true }}
      className="relative rounded-2xl overflow-hidden shadow-lg aspect-square max-w-lg mx-auto lg:max-w-none bg-slate-200">
      <Image
        src={WhyusImage}
        alt="لماذا تختار قهوجيين الرياض لمناسبتك؟"
        width={600}
        height={600}
        className="w-full h-full object-cover object-center"
      />
    </motion.div>
  );
}
