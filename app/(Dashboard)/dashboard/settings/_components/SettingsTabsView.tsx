"use client";

import React, { useState } from "react";
import { SiteSettings, LocationData } from "@/lib/types";
import SettingsForm from "./SettingsForm";
import LocationSettingsSection from "./LocationSettingsSection";
import { Globe, MapPin } from "lucide-react";

interface SettingsTabsViewProps {
  initialSettings: SiteSettings | null;
  initialLocation: LocationData | null;
  token: string;
}

export default function SettingsTabsView({
  initialSettings,
  initialLocation,
  token,
}: SettingsTabsViewProps) {
  const [activeTab, setActiveTab] = useState<"general" | "location">("general");

  return (
    <div className="space-y-6">
      {/* Modern Pill Tabs */}
      <div
        className="flex flex-col sm:flex-row items-center gap-2 border-b border-gray-200 pb-3"
        dir="rtl">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
            activeTab === "general"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}>
          <Globe className="w-4 h-4" />
          <span>الإعدادات العامة ومحركات البحث</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("location")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
            activeTab === "location"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}>
          <MapPin className="w-4 h-4" />
          <span>الموقع الجغرافي والخرائط</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "general" ? (
        <SettingsForm initialData={initialSettings} token={token} />
      ) : (
        <LocationSettingsSection initialData={initialLocation} token={token} />
      )}
    </div>
  );
}
