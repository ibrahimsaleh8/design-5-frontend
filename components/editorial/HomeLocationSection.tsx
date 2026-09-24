"use client";

import React, { useState } from "react";
import { LocationData, PlaceSelectedData } from "@/lib/types";
import PlaceSearchMap, {
  PlaceSearchValue,
} from "@/components/map/PlaceSearchMap";
import {
  MapPin,
  Compass,
  Navigation,
  Building2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

interface HomeLocationSectionProps {
  initialLocation?: LocationData | null;
}

export default function HomeLocationSection({
  initialLocation,
}: HomeLocationSectionProps) {
  console.log(initialLocation);

  return (
    <section className="site-container pb-12 md:pb-16 my-8" dir="rtl">
      <div className="flex items-center gap-3.5 bg-green-800 p-5 rounded-2xl">
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white">
            {initialLocation?.name || "الموقع الجغرافي والفرع الرئيسي"}
          </h2>
          <p className="text-xs md:text-sm text-white mt-0.5">
            {initialLocation?.address ||
              "ابحث باللغة العربية عن المكان واستكشف موقعه بدقة على الخريطة التفاعلية"}
          </p>
        </div>
      </div>
    </section>
  );
}
