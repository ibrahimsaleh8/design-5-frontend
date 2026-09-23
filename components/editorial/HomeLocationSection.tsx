"use client";

import React, { useState } from "react";
import { LocationData, PlaceSelectedData } from "@/lib/types";
import PlaceSearchMap, { PlaceSearchValue } from "@/components/map/PlaceSearchMap";
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
  // Initial coordinates from api/location or fallback
  const hasDefaultCoords =
    initialLocation?.latitude !== undefined &&
    initialLocation?.latitude !== null &&
    initialLocation?.longitude !== undefined &&
    initialLocation?.longitude !== null &&
    !isNaN(Number(initialLocation.latitude)) &&
    !isNaN(Number(initialLocation.longitude));

  const [currentLocation, setCurrentLocation] = useState<PlaceSearchValue>({
    name: initialLocation?.name || "",
    address: initialLocation?.address || "",
    latitude: hasDefaultCoords ? Number(initialLocation?.latitude) : null,
    longitude: hasDefaultCoords ? Number(initialLocation?.longitude) : null,
  });

  // Calculate default center for map
  const defaultCenter: [number, number] = hasDefaultCoords
    ? [Number(initialLocation!.longitude), Number(initialLocation!.latitude)]
    : [46.6753, 24.7136]; // Default to Riyadh

  // Check if current location differs from initial
  const isDifferentFromDefault =
    hasDefaultCoords &&
    (currentLocation.latitude !== Number(initialLocation?.latitude) ||
      currentLocation.longitude !== Number(initialLocation?.longitude));

  // Handle location selection from search or map click
  const handleMapLocationChange = (place: PlaceSelectedData) => {
    setCurrentLocation({
      name: place.name || currentLocation.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  };

  // Reset to initial location from api/location
  const handleResetToDefault = () => {
    if (!initialLocation) return;
    setCurrentLocation({
      name: initialLocation.name || "",
      address: initialLocation.address || "",
      latitude: hasDefaultCoords ? Number(initialLocation.latitude) : null,
      longitude: hasDefaultCoords ? Number(initialLocation.longitude) : null,
    });
  };

  return (
    <section className="site-container pb-12 md:pb-16 my-8" dir="rtl">
      {/* Location Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                {initialLocation?.name || "الموقع الجغرافي والفرع الرئيسي"}
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                {initialLocation?.address ||
                  "ابحث باللغة العربية عن المكان واستكشف موقعه بدقة على الخريطة التفاعلية"}
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {isDifferentFromDefault && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-emerald-200 transition-colors cursor-pointer"
                title="العودة إلى الموقع الافتراضي">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>المقر الرئيسي</span>
              </button>
            )}

            {typeof currentLocation.latitude === "number" &&
              typeof currentLocation.longitude === "number" && (
                <a
                  href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition-colors font-medium">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>فتح في خرائط Google</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
          </div>
        </div>

        {/* Map + Autocomplete Search Component */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>البحث عن مكان / تحديد النقطة على الخريطة</span>
            </label>
            {typeof currentLocation.latitude === "number" &&
              typeof currentLocation.longitude === "number" && (
                <span className="text-xs text-gray-400 font-mono" dir="ltr">
                  {currentLocation.latitude.toFixed(4)},{" "}
                  {currentLocation.longitude.toFixed(4)}
                </span>
              )}
          </div>

          <PlaceSearchMap
            value={currentLocation}
            onChange={handleMapLocationChange}
            country="sa"
            language="ar"
            defaultCenter={defaultCenter}
            placeholder="ابحث عن مكان، حي، أو عنوان في السعودية بالعربية..."
            height="440px"
            allowMapClick={true}
            showQuickPresets={true}
          />
        </div>

        {/* Selected Location Summary Info (Read-only) */}
        {(currentLocation.name || currentLocation.address) && (
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-600">
            {currentLocation.name && (
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium text-gray-700">
                  {currentLocation.name}
                </span>
              </div>
            )}
            {currentLocation.address && (
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex-1 min-w-[200px]">
                <Navigation className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{currentLocation.address}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
